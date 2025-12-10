@echo off
chcp 65001 >nul
title 微信视频号监听工具

echo ================================================
echo    微信视频号直播监听工具
echo ================================================
echo.

cd /d "%~dp0"

echo 正在启动 wxlivespy...
echo.

npm start

echo.
echo 程序已退出
pause
