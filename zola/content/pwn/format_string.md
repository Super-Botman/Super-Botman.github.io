+++
title="Book Writer WU"
+++

# [Pwn] book_writer | fcsc2024

## Checksec

```bash
[*] '/home/botman/Documents/cybersec/CTF/team/0xb0tm4n/fcsc2024/pwn/book_writer/test'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
```
```bash
[*] '/home/botman/Documents/cybersec/CTF/team/0xb0tm4n/fcsc2024/pwn/book_writer/book-writer'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
```
```bash
[*] '/home/botman/Documents/cybersec/CTF/team/0xb0tm4n/fcsc2024/pwn/book_writer/ld-2.36.so'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled
```
```bash
[*] '/home/botman/Documents/cybersec/CTF/team/0xb0tm4n/fcsc2024/pwn/book_writer/libc-2.36.so'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
```
## How to run the exploit

```bash
./run.py ./test
```
## Writeup

**Written by *0xB0tm4n***
