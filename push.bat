@echo off
cd /d "C:\GIT-personal\JiraProdutividade"

echo.
set /p VERSION=Versão (ex: v1.2.8): 
set /p MSG=Descrição do commit: 

echo.
git add squad-logwork.html README.md
git commit -m "%VERSION% - %MSG%"

echo.
echo Sincronizando com remote...
git pull --rebase
if %errorlevel% neq 0 (
    echo.
    echo ERRO no pull. Resolva os conflitos e execute "git rebase --continue" manualmente.
    pause
    exit /b 1
)

git push
echo.
pause