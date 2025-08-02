#!/bin/bash

# Production startup script

echo "Starting production environment..."

# Check if docker-compose.prod.yml exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "Error: docker-compose.prod.yml not found!"
    exit 1
fi

# Check if .env.production exists
if [ ! -f "app/.env.production" ]; then
    echo "Error: app/.env.production not found!"
    exit 1
fi

# Create necessary directories
mkdir -p ssl uploaded_images
chmod 755 uploaded_images

# Pull latest images
echo "Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Start services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check service status
echo "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo "Deployment completed!"
echo "Check logs with: docker-compose -f docker-compose.prod.yml logs -f"
