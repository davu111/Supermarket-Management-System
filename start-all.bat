@echo off
chcp 65001 >nul
color 0A
title Supermarket Microservices Startup

echo ╔════════════════════════════════════════════════════════════════╗
echo ║        SUPERMARKET MICROSERVICES - KHỞI ĐỘNG HỆ THỐNG         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM ===== CẤU HÌNH - Thay đổi đường dẫn theo máy của bạn =====
set PROJECT_ROOT=D:\ADMIN\Java Spring Boot\supermarket-management-system
set FRONTEND_PATH=%PROJECT_ROOT%\frontend

REM Danh sách các services
set SERVICES=api-gateway-supermarket coupon-market-service customer-market-service employee-market-service inventory-market-service product-market-service transaction-market-service

echo [1/4] Kiểm tra Docker đang chạy...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker chưa được khởi động! Vui lòng mở Docker Desktop.
    pause
    exit /b 1
)
echo ✓ Docker đang hoạt động
echo.

echo [2/4] Khởi động Databases và Dependencies...
echo ════════════════════════════════════════════════════════════════

for %%s in (%SERVICES%) do (
    echo.
    echo ➜ Khởi động database cho: %%s
    cd /d "%PROJECT_ROOT%\backend\%%s"
    if exist docker-compose.yml (
        docker-compose up -d
        echo   ✓ Database %%s đã khởi động
    ) else (
        echo   ⚠ Không tìm thấy docker-compose.yml trong %%s
    )
)

echo.
echo ⏳ Chờ databases khởi tạo hoàn tất (15 giây)...
timeout /t 15 /nobreak >nul
echo.

echo [3/4] Khởi động Backend Services (Spring Boot)...
echo ════════════════════════════════════════════════════════════════

for %%s in (%SERVICES%) do (
    echo.
    echo ➜ Khởi động backend: %%s
    cd /d "%PROJECT_ROOT%\backend\%%s"
    
    REM Kiểm tra xem có file Maven wrapper không
    if exist mvnw.cmd (
        start "Backend: %%s" cmd /k "title %%s && mvnw.cmd spring-boot:run"
    ) else if exist pom.xml (
        start "Backend: %%s" cmd /k "title %%s && mvn spring-boot:run"
    ) else (
        echo   ⚠ Không tìm thấy Maven project trong %%s
    )
    
    REM Delay nhỏ giữa các service để tránh quá tải
    timeout /t 3 /nobreak >nul
)

echo.
echo ⏳ Chờ backend services khởi động (20 giây)...
timeout /t 20 /nobreak >nul
echo.

echo [4/4] Khởi động Frontend (React)...
echo ════════════════════════════════════════════════════════════════

if exist "%FRONTEND_PATH%" (
    cd /d "%FRONTEND_PATH%"
    
    REM Kiểm tra node_modules có tồn tại không
    if not exist node_modules (
        echo ⏳ Cài đặt dependencies cho Frontend...
        call npm install
    )
    
    echo ➜ Khởi động React Frontend...
    start "Frontend: React" cmd /k "title React Frontend && npm run dev"
    echo   ✓ Frontend đã khởi động
) else (
    echo ⚠ Không tìm thấy thư mục Frontend tại: %FRONTEND_PATH%
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                  ✓ HỆ THỐNG ĐÃ KHỞI ĐỘNG!                     ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║  Services đang chạy:                                           ║
echo ║  • API Gateway                                                 ║
echo ║  • Coupon Service                                              ║
echo ║  • Customer Service                                            ║
echo ║  • Employee Service                                            ║
echo ║  • Inventory Service                                           ║
echo ║  • Product Service                                             ║
echo ║  • Transaction Service                                         ║
echo ║  • Frontend (React)                                            ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║  💡 Tip: Để dừng tất cả services, chạy: stop-all.bat          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Nhấn phím bất kỳ để đóng cửa sổ này...
pause >nul