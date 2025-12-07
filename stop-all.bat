@echo off
chcp 65001 >nul
color 0C
title Supermarket Microservices Shutdown

echo ╔════════════════════════════════════════════════════════════════╗
echo ║         SUPERMARKET MICROSERVICES - DỪNG HỆ THỐNG             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM ===== CẤU HÌNH - Thay đổi đường dẫn theo máy của bạn =====
set PROJECT_ROOT=D:\ADMIN\Java Spring Boot\supermarket-management-system

REM Danh sách các services
set SERVICES=api-gateway-supermarket coupon-market-service customer-market-service employee-market-service inventory-market-service product-market-service transaction-market-service

echo [1/3] Dừng Backend Services (Spring Boot)...
echo ════════════════════════════════════════════════════════════════

REM Tìm và đóng tất cả processes Spring Boot
for /f "tokens=2" %%a in ('tasklist ^| findstr /i "java.exe"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo ✓ Đã dừng tất cả Spring Boot services
echo.

echo [2/3] Dừng Frontend (React/Node)...
echo ════════════════════════════════════════════════════════════════

REM Tìm và đóng tất cả processes Node
for /f "tokens=2" %%a in ('tasklist ^| findstr /i "node.exe"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo ✓ Đã dừng Frontend
echo.

echo [3/3] Dừng Docker Containers...
echo ════════════════════════════════════════════════════════════════

for %%s in (%SERVICES%) do (
    echo ➜ Dừng containers trong: %%s
    cd /d "%PROJECT_ROOT%\%%s"
    if exist docker-compose.yml (
        docker-compose down
        echo   ✓ Đã dừng containers của %%s
    )
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║               ✓ ĐÃ DỪNG TẤT CẢ SERVICES!                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Nhấn phím bất kỳ để đóng cửa sổ này...
pause >nul