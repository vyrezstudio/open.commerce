@echo off
chcp 65001 >nul
title OpenCommerce
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js nao encontrado.
  echo  Instale em https://nodejs.org/ e tente novamente.
  echo.
  pause
  exit /b 1
)

echo.
echo  Iniciando o OpenCommerce...
echo  O navegador abrira em http://127.0.0.1:4173/
echo  Para encerrar, pressione Ctrl+C nesta janela.
echo.

node "%~dp0server.js" --open
pause
