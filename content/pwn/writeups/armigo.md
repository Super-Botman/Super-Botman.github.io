+++
title = "Hackropole | Armigo"
+++

# [Pwn] armigo | hackropole

## Checksec

```bash
[*] '/home/botman/Documents/cybersec/CTF/solo/hackropole/pwn/armigo/armigo'
    Arch:     arm-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x10000)
```

## Writeup

So this is yet another ARM pwn challenge !
We begin by open the binary in ghidra and check the main function, firstly we see a bof and then we can see another interesting function called "debug", this one is interesting becauseit's look like it's run some shell commands

![main](/images/armigo/main.png)

So now we can look into debug and yes! it's take the first argument and run system with it

![debug](/images/armigo/debug.png)

Ok, cool but how can we use this command to get the flag ? 
We can going to build a really easy ROP with a pop r0 with a command like "/bin/bash" or "cat flag" and then ret to debug no ?
Firstly we're gonna check i there is some string who can help us and yes, we can find the string "cat flag" at the address *0x000733fc*

![cat flag](/images/armigo/cat_flag.png)

Ok, so we just have to find a pop instruction and this should be easy because we have a big binary, and yes, it was easy

![pop](/images/armigo/pop.png)

So, i'm gonna summarize,
we have:
    - a pop instruction
    - a "cat flag" string
    - a debug function who run our shell command

so we're juste gonna build our rop like this:
```exploit
padding + pop + cat_flag + debug
```
this will pop r0 and lr (which is the "parente return address") and then put "cat flag" in r0 and debug addr in lr, after this there is a "bx lr" instruction which will jmp to our addr. 

and here we go, we got the flag

![flag](/images/armigo/flag.png)

full exploit [here](/armigo/exploits/armigo.py)

**Writed by 0xB0tm4n**
