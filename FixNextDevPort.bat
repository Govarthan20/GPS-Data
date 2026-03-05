@echo off
echo Opening port 3000...
netsh advfirewall firewall add rule name="Next.js Dev Server 3000" dir=in action=allow protocol=TCP localport=3000
echo Done.
