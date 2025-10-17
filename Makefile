.PHONY: help dev stop clean logs db-reset db-push db-migrate build lint format test

help:
	@echo "Mile Buy Club - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start Docker services and dev servers"
	@echo "  make stop             Stop all Docker services"
	@echo "  make clean            Clean Docker containers and volumes"
	@echo "  make logs             Show Docker logs (Ctrl+C to exit)"
	@echo ""
	@echo "Database:"
	@echo "  make db-reset         Reset database (deletes all data!)"
	@echo "  make db-push          Apply schema changes"
	@echo "  make db-migrate       Create new migration"
	@echo "  make db-studio        Open Prisma Studio"
	@echo ""
	@echo "Build & Quality:"
	@echo "  make build            Build all packages"
	@echo "  make lint             Lint all packages"
	@echo "  make format           Format all code"
	@echo "  make test             Run all tests"
	@echo ""

# Development
dev:
	@echo "Starting Docker services..."
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	sleep 5
	@echo "✅ Services are running:"
	@echo "   PostgreSQL: localhost:5432"
	@echo "   Redis:      localhost:6379"
	@echo "   Mailhog:    localhost:8025"
	@echo ""
	@echo "Starting development servers..."
	npm run dev

stop:
	@echo "Stopping Docker services..."
	docker-compose down
	@echo "✅ Services stopped"

clean:
	@echo "Cleaning Docker containers and volumes..."
	docker-compose down -v
	@echo "Removing node_modules..."
	npm run clean
	@echo "✅ Cleaned"

logs:
	docker-compose logs -f

# Database
db-reset:
	@echo "⚠️  WARNING: This will DELETE all data!"
	@read -p "Press ENTER to continue or Ctrl+C to abort..." confirm
	docker-compose exec postgres psql -U dev -c "DROP DATABASE milebyclub;" 2>/dev/null || true
	docker-compose exec postgres psql -U dev -c "CREATE DATABASE milebyclub;"
	npm run db:push
	@echo "✅ Database reset"

db-push:
	npm run db:push

db-migrate:
	npm run db:migrate

db-studio:
	npm run db:studio

# Build & Quality
build:
	npm run build

lint:
	npm run lint

format:
	npm run format

test:
	npm run test

# Production
docker-build-api:
	docker build -t milebyclub-api:latest -f apps/api/Dockerfile .

docker-build-web:
	docker build -t milebyclub-web:latest -f apps/web/Dockerfile .

docker-build: docker-build-api docker-build-web
	@echo "✅ Docker images built"
