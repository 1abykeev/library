.PHONY: build up down logs shell restart

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec backend sh

restart:
	docker compose restart
