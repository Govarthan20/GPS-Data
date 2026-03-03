@echo off
echo.
echo =======================================================
echo Checking for Administrator privileges...
echo =======================================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Administrator privileges not found.
    echo Requesting Administrator privileges (please click "Yes" on the prompt)...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B
)

echo.
echo Administrator privileges successfully granted!
echo Creating Firewall Rule to allow Sensagram (UDP Port 5000)...
echo.
netsh advfirewall firewall add rule name="Sensagram UDP 5000" dir=in action=allow protocol=UDP localport=5000

echo.
echo SUCCESS! Port 5000 is now open. 
echo Ensure your Sensagram app is pointing to IP 192.168.1.39 on Port 5000.
echo.
pause
