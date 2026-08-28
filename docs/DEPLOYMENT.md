# PayLens Deployment Guide

This guide covers deploying PayLens to various environments using Docker.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum (16GB recommended)
- 20GB disk space
- SSL certificate (for production)

## Environment Setup

### Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd paylens
   ```

2. **Configure environment**
   ```bash
   cp .env.docker .env
   # Edit .env with your configuration
   ```

3. **Start development services**
   ```bash
   make up-dev
   ```

This starts only the infrastructure services (PostgreSQL, ChromaDB, Ollama) for local development.

### Production Environment

1. **Configure environment**
   ```bash
   cp .env.docker .env
   # Update with production values:
   # - Change DEBUG to false
   # - Update SECRET_KEY with a strong random key
   # - Update database credentials
   # - Configure SSL certificates
   ```

2. **Build and start all services**
   ```bash
   make build
   make up
   ```

3. **Initialize data**
   ```bash
   make seed-db
   make index-runbooks
   ```

## Docker Configuration

### Services

The docker-compose.yml includes the following services:

- **postgres**: PostgreSQL 15 database
- **chromadb**: Vector database for runbooks
- **ollama**: LLM service for AI agents
- **backend**: FastAPI backend service
- **frontend**: Next.js frontend application

### Resource Allocation

Default resource limits:

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
  
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
  
  frontend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

## Deployment Strategies

### Single Server Deployment

Deploy all services on a single server:

```bash
# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Multi-Server Deployment

For production, consider separating services:

1. **Database Server**: PostgreSQL
2. **Application Server**: Backend + Frontend
3. **AI Services Server**: ChromaDB + Ollama

Update connection strings in `.env` accordingly.

### Cloud Deployment

#### AWS Deployment

1. **Use ECS/EKS** for container orchestration
2. **RDS** for PostgreSQL
3. **ElastiCache** if caching is needed
4. **ALB/ELB** for load balancing

Example ECS task definition:
```json
{
  "family": "paylens-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-registry/paylens-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/paylens"
        }
      ]
    }
  ]
}
```

#### Google Cloud Deployment

1. **Use GKE** for container orchestration
2. **Cloud SQL** for PostgreSQL
3. **Cloud Load Balancing** for traffic distribution

#### Azure Deployment

1. **Use AKS** for container orchestration
2. **Azure Database for PostgreSQL**
3. **Azure Load Balancer**

## SSL/TLS Configuration

### Using Let's Encrypt with Certbot

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Configure Nginx reverse proxy**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api/ {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Using Self-Signed Certificates (Development)

1. **Generate self-signed certificate**
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /path/to/key.pem \
     -out /path/to/cert.pem
   ```

2. **Update docker-compose.yml** to mount certificates
   ```yaml
   services:
     backend:
       volumes:
         - /path/to/cert.pem:/etc/ssl/certs/cert.pem
         - /path/to/key.pem:/etc/ssl/private/key.pem
   ```

## Database Management

### Backups

#### Automated Backups

Add to docker-compose.yml:
```yaml
services:
  backup:
    image: prodrigestivill/postgres-backup-local
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=paylens
      - POSTGRES_USER=paylens
      - POSTGRES_PASSWORD=paylens
      - SCHEDULE=@daily
      - BACKUP_KEEP_DAYS=7
    volumes:
      - ./backups:/backups
```

#### Manual Backup

```bash
docker-compose exec postgres pg_dump -U paylens paylens > backup.sql
```

#### Restore from Backup

```bash
docker-compose exec -T postgres psql -U paylens paylens < backup.sql
```

### Migrations

Run database migrations:
```bash
docker-compose exec backend alembic upgrade head
```

Rollback migrations:
```bash
docker-compose exec backend alembic downgrade -1
```

## Monitoring

### Health Checks

All services include health checks:

```bash
# Check all service health
docker-compose ps

# Check specific service
docker-compose exec backend curl http://localhost:8000/health
```

### Logging

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Metrics

Enable metrics collection (future enhancement):
- Add Prometheus exporter
- Configure Grafana dashboards
- Set up alerting

## Scaling

### Horizontal Scaling

Scale backend services:
```bash
docker-compose up -d --scale backend=3
```

### Load Balancing

Configure load balancer (Nginx example):
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

## Security

### Best Practices

1. **Use strong passwords** in environment variables
2. **Enable SSL/TLS** for all communications
3. **Restrict database access** to internal network only
4. **Use secrets management** (AWS Secrets Manager, HashiCorp Vault)
5. **Regular security updates** for base images
6. **Network segmentation** for services
7. **Firewall rules** to restrict access

### Environment Variables

Never commit `.env` files. Use:
- Docker secrets
- Environment-specific .env files
- Secrets management services

## Troubleshooting

### Common Issues

#### Services won't start

```bash
# Check logs
docker-compose logs

# Check resource usage
docker stats

# Restart services
docker-compose restart
```

#### Database connection errors

```bash
# Check if postgres is running
docker-compose ps postgres

# Test connection
docker-compose exec backend python -c "from app.db.connection import engine; engine.connect()"
```

#### Ollama not responding

```bash
# Check Ollama status
docker-compose exec ollama ollama list

# Pull required model
docker-compose exec ollama ollama pull llama3
```

#### ChromaDB issues

```bash
# Check ChromaDB logs
docker-compose logs chromadb

# Re-index runbooks
docker-compose exec backend python -m scripts.index_runbooks
```

## Performance Optimization

### Database Optimization

1. **Add indexes** for frequently queried fields
2. **Connection pooling** - configured in SQLAlchemy
3. **Query optimization** - use EXPLAIN ANALYZE
4. **Regular vacuuming** - PostgreSQL maintenance

### Application Optimization

1. **Enable caching** for frequent API calls
2. **Optimize ChromaDB queries** with better embeddings
3. **Batch processing** for bulk operations
4. **Async operations** where possible

## Maintenance

### Regular Tasks

- **Daily**: Review logs and metrics
- **Weekly**: Database backups, security updates
- **Monthly**: Review and optimize performance, cleanup old data

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose build

# Restart services
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head
```

## Disaster Recovery

### Backup Strategy

1. **Database backups** - Daily, kept for 30 days
2. **ChromaDB backups** - Weekly, kept for 90 days  
3. **Configuration backups** - Version controlled
4. **Runbook backups** - Version controlled

### Recovery Procedure

1. **Restore database** from latest backup
2. **Re-index ChromaDB** with runbooks
3. **Restore configuration** from version control
4. **Verify all services** are operational
5. **Test critical functionality**

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Review this documentation
3. Check GitHub issues
4. Contact support team