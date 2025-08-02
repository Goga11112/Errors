@echo off
echo Starting production environment...

REM Check if docker-compose.prod.yml exists
if not exist "docker-compose.prod.yml" (
    echo Error: docker-compose.prod.yml not found!
    exit /b 1
)

REM Check if .env.production exists
if not exist "app\.env.production" (
    echo Error: app\.env.production not found!
    exit /b 1
)

REM Create necessary directories
mkdir ssl >nul 2>&1
mkdir uploaded_images >nul 2>&1

echo Pulling latest images...
docker-compose -f docker-compose.prod.yml pull

echo Starting services...
docker-compose -f docker-compose.prod.yml up -d

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo Checking service status...
docker-compose -f docker-compose.prod.yml ps

echo Deployment completed!
echo Check logs with: docker-compose -f docker-compose.prod.yml logs -f
pause
