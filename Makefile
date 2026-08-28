.PHONY: help build up down restart logs clean install-dev test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker containers
	docker-compose build

up: ## Start all services
	docker-compose up -d

up-dev: ## Start development services (postgres, chromadb, ollama)
	docker-compose -f docker-compose.dev.yml up -d

down: ## Stop all services
	docker-compose down

down-dev: ## Stop development services
	docker-compose -f docker-compose.dev.yml down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

clean: ## Stop and remove all containers, volumes, and networks
	docker-compose down -v
	docker system prune -f

install-dev: ## Install development dependencies
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	cd tests && npm install

test: ## Run all tests
	cd tests && npm test

test-ui: ## Run tests in UI mode
	cd tests && npm run test:ui

seed-db: ## Seed database with synthetic data
	docker-compose exec backend python -m scripts.seed_database

index-runbooks: ## Index runbooks in ChromaDB
	docker-compose exec backend python -m scripts.index_runbooks

generate-data: ## Generate synthetic data
	docker-compose exec backend python -m scripts.generate_synthetic_data

setup: ## Complete setup (build, up, seed, index)
	make build
	make up
	sleep 10
	make seed-db
	make index-runbooks

ps: ## Show running containers
	docker-compose ps

shell-backend: ## Open shell in backend container
	docker-compose exec backend bash

shell-postgres: ## Open postgres shell
	docker-compose exec postgres psql -U paylens -d paylens