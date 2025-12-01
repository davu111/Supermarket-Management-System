# ===============================================
# Script tự động build và push tất cả services
# ===============================================

$DOCKER_USERNAME = "duonganhvu"
$PROJECT_NAME = "supermarket"
$VERSION = "latest"

# Danh sách các services (tên thư mục)
$services = @(
    "api-gateway-supermarket",
    "coupon-market-service",
    "customer-market-service",
    "employee-market-service",
    "inventory-market-service",
    "product-market-service",
    "transaction-market-service"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SUPERMARKET MICROSERVICES - BUILD & PUSH" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Lưu thư mục hiện tại
$originalPath = Get-Location

$successCount = 0
$failCount = 0
$failedServices = @()

foreach ($service in $services) {
    $currentIndex = $services.IndexOf($service) + 1
    $totalServices = $services.Count

    Write-Host "[$currentIndex/$totalServices] Processing: $service" -ForegroundColor Yellow
    Write-Host "-------------------------------------------" -ForegroundColor Gray

    # Kiểm tra thư mục service có tồn tại không
    if (-Not (Test-Path $service)) {
        Write-Host "ERROR: Folder '$service' not found!" -ForegroundColor Red
        $failCount++
        $failedServices += $service
        Write-Host ""
        continue
    }

    # Di chuyển vào thư mục service
    Set-Location $service

    # Kiểm tra Dockerfile có tồn tại không
    if (-Not (Test-Path "Dockerfile")) {
        Write-Host "WARNING: Dockerfile not found in '$service'. Skipping..." -ForegroundColor Yellow
        Set-Location $originalPath
        $failCount++
        $failedServices += $service
        Write-Host ""
        continue
    }

    # Tạo tên image (loại bỏ -market từ tên service để ngắn gọn hơn)
    $imageName = $service -replace "-market", ""
    $fullImageName = "$DOCKER_USERNAME/$PROJECT_NAME-$imageName`:$VERSION"

    Write-Host "Building image: $fullImageName" -ForegroundColor Cyan

    # Build Docker image
    docker build -t $fullImageName .

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful!" -ForegroundColor Green

        Write-Host "Pushing to Docker Hub..." -ForegroundColor Cyan

        # Push Docker image
        docker push $fullImageName

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Push successful!" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "Push failed!" -ForegroundColor Red
            $failCount++
            $failedServices += $service
        }
    } else {
        Write-Host "Build failed!" -ForegroundColor Red
        $failCount++
        $failedServices += $service
    }

    # Quay lại thư mục gốc
    Set-Location $originalPath
    Write-Host ""
}

# Tổng kết
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "                 SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Successful: $successCount/$totalServices" -ForegroundColor Green
Write-Host "Failed: $failCount/$totalServices" -ForegroundColor Red

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Failed services:" -ForegroundColor Red
    foreach ($failed in $failedServices) {
        Write-Host "  - $failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All done!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Pause để xem kết quả
Read-Host -Prompt "Press Enter to exit"