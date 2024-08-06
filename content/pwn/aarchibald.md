+++
title = "Hackropole | Aarchibald"
+++

# [Pwn] aarchibald | hackropole

## Checksec

```bash
[*] '/home/botman/Documents/cybersec/CTF/solo/hackropole/pwn/aarchibald/aarchibald'
    Arch:     aarch64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled
```

## Writeup


Firstly we're gonna open our binary into a decompiler and we can directly see that there is a loop which will XOR our input with 0x32 value and then compare the 13 first bytes of the result with another value at the address 0xc30
![xor + strcmp](/images/aarchibald/xor_strcmp.png)

So we're gonna see what's hidden at this address and we find this

![xored password](/images/aarchibald/xored_password.png)

Ok, cool we have the password XORed and the key so we juste have to decrypt it 

![password](/images/aarchibald/password.png)

So we have the password we're left with one step wich is to pass the last check before our shell

![bof](/images/aarchibald/bof.png)

We see that there is only one variable on the stack which contains a value and to get our chall we have to overwrite it with another value, it's a basic buffer oveflow, so we just have to add a lot of A on the end of our password and tadaaa

![win](/images/aarchibald/win.png)

you can find the full exploit [here](/exploits/aarchibald.py)

written by *0xB0tm4n*
