@echo off
start "" /B node "C:\GIT-personal\JiraProdutividade\proxy.js"
timeout /t 3 /nobreak > nul
start "" "chrome.exe" "file:///C:/GIT-personal/JiraProdutividade/squad-logwork.html"