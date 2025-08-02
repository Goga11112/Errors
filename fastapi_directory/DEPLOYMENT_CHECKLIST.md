# Deployment Checklist

## Pre-deployment Tasks

### 1. Security
- [ ] Change all default passwords in docker-compose.prod.yml
- [ ] Generate a secure SECRET_KEY for JWT tokens
- [ ] Ensure .env.production is not committed to version control
- [ ] Review and update SSL certificates

### 2. Configuration
- [ ] Update server_name in nginx.prod.conf to your domain
- [ ] Verify database connection settings
- [ ] Check file permissions for uploaded images
- [ ] Review and adjust resource limits (CPU, memory)

### 3. Database
- [ ] Backup existing production database (if applicable)
- [ ] Test database migration scripts
- [ ] Verify Alembic migrations are up to date

### 4. Code Review
- [ ] Remove any development-specific code or debug statements
- [ ] Ensure all environment variables are properly configured
- [ ] Check for hardcoded values that should be configurable

## Deployment Steps

### 1. Server Preparation
- [ ] Ensure Docker and Docker Compose are installed
- [ ] Open required ports (80, 443, 5432)
- [ ] Set up SSL certificates in the ssl directory
- [ ] Create necessary directories and set permissions

### 2. Application Deployment
- [ ] Copy project files to the server
- [ ] Update configuration files with production values
- [ ] Run database migrations if needed
- [ ] Start services with: `docker-compose -f docker-compose.prod.yml up -d`

### 3. Post-deployment Verification
- [ ] Check container status: `docker-compose -f docker-compose.prod.yml ps`
- [ ] Verify application is accessible through the browser
- [ ] Test API endpoints
- [ ] Check database connectivity
- [ ] Verify file uploads work correctly
- [ ] Test user authentication and authorization

## Monitoring and Maintenance

### 1. Monitoring Setup
- [ ] Set up log aggregation (ELK stack or similar)
- [ ] Configure health checks and alerts
- [ ] Set up application performance monitoring (APM)

### 2. Backup Strategy
- [ ] Implement regular database backups
- [ ] Backup uploaded images and other persistent data
- [ ] Test backup restoration procedures

### 3. Update Procedures
- [ ] Document the process for deploying updates
- [ ] Plan for zero-downtime deployments if required
- [ ] Set up CI/CD pipeline for automated deployments

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check database credentials in docker-compose.prod.yml
   - Verify database container is running

2. **Application Not Accessible**
   - Check Nginx configuration
   - Verify firewall settings
   - Check container logs: `docker-compose logs`

3. **File Upload Issues**
   - Check directory permissions
   - Verify UPLOAD_DIR environment variable

### Useful Commands
- View container logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Restart services: `docker-compose -f docker-compose.prod.yml restart`
- Stop services: `docker-compose -f docker-compose.prod.yml down`
- Start services: `docker-compose -f docker-compose.prod.yml up -d`
- Check service status: `docker-compose -f docker-compose.prod.yml ps`
