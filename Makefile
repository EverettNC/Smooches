# SMOOCHES Makefile — One-command deploys

.PHONY: help dev build push deploy-infra deploy-app-runner migrate logs

# Default target
help:
	@echo "SMOOCHES Makefile"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Run dev server (tsx)"
	@echo "  make build            - Build for production (vite + esbuild)"
	@echo "  make check            - TypeScript type check"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build     - Build multi-stage production image"
	@echo "  make docker-run       - Run built image locally on port 8030"
	@echo ""
	@echo "AWS Deployment:"
	@echo "  make deploy-infra     - Deploy CloudFormation stack (RDS, S3, ECR, VPC, ECS)"
	@echo "  make push-image       - Build & push Docker image to ECR"
	@echo "  make deploy-app-runner - Full App Runner deploy (infra + image + service)"
	@echo ""
	@echo "Database:"
	@echo "  make migrate          - Run drizzle migrations against DATABASE_URL"
	@echo "  make db-studio        - Open Drizzle Studio"
	@echo ""
	@echo "Utils:"
	@echo "  make logs             - Tail CloudWatch logs (requires stack name)"
	@echo "  make clean            - Remove dist, node_modules, docker images"

# Development
dev:
	npm run dev

build:
	npm run build

check:
	npm run check

# Docker
docker-build:
	docker build -t smooches:latest .

docker-run:
	docker run --rm -p 8030:8030 --env-file .env smooches:latest

# AWS - Infrastructure
deploy-infra:
	@if [ -z "$$DATABASE_PASSWORD" ] || [ -z "$$SESSION_SECRET" ]; then \
		echo "❌ Set DATABASE_PASSWORD and SESSION_SECRET env vars"; exit 1; \
	fi
	aws cloudformation deploy \
		--template-url https://smooches-cfn-templates-846769760150.s3.us-east-1.amazonaws.com/aws-infrastructure.yml \
		--stack-name smooches-infrastructure \
		--parameter-overrides \
			DatabasePassword="$$DATABASE_PASSWORD" \
			SessionSecret="$$SESSION_SECRET" \
			StripeSecretKey="$${STRIPE_SECRET_KEY:-}" \
			StripePublishableKey="$${STRIPE_PUBLISHABLE_KEY:-}" \
			StripeWebhookSecret="$${STRIPE_WEBHOOK_SECRET:-}" \
			OpenAIKey="$${OPENAI_API_KEY:-}" \
			DispatchIngestHost="$${DISPATCH_INGEST_HOST:-}" \
		--capabilities CAPABILITY_IAM \
		--region $${AWS_REGION:-us-east-1}

# AWS - Push Docker image to ECR
push-image:
	@if [ -z "$$AWS_ACCOUNT_ID" ]; then \
		export AWS_ACCOUNT_ID=$$(aws sts get-caller-identity --query Account --output text); \
	fi
	docker build -t smooches:latest .
	aws ecr get-login-password --region $${AWS_REGION:-us-east-1} | docker login --username AWS --password-stdin $$AWS_ACCOUNT_ID.dkr.ecr.$${AWS_REGION:-us-east-1}.amazonaws.com
	docker tag smooches:latest $$AWS_ACCOUNT_ID.dkr.ecr.$${AWS_REGION:-us-east-1}.amazonaws.com/smooches:latest
	docker tag smooches:latest $$AWS_ACCOUNT_ID.dkr.ecr.$${AWS_REGION:-us-east-1}.amazonaws.com/smooches:$$(date +%Y%m%d%H%M%S)
	docker push $$AWS_ACCOUNT_ID.dkr.ecr.$${AWS_REGION:-us-east-1}.amazonaws.com/smooches:latest
	docker push $$AWS_ACCOUNT_ID.dkr.ecr.$${AWS_REGION:-us-east-1}.amazonaws.com/smooches:$$(date +%Y%m%d%H%M%S)

# AWS - Full App Runner deploy (infra + image + service steps)
deploy-app-runner: deploy-infra push-image
	@echo ""
	@echo "✅ Infra deployed, image pushed to ECR."
	@echo ""
	@echo "Next: Create App Runner service in AWS Console:"
	@echo "  1. Console → App Runner → Create service"
	@echo "  2. Source: ECR → select smooches:latest"
	@echo "  3. Port: 8030"
	@echo "  4. Health check: /api/health"
	@echo "  4. Env vars (required):"
	@echo "     NODE_ENV=production"
	@echo "     PORT=8030"
	@echo "     DATABASE_URL=postgresql://smooches:***@<RDS_ENDPOINT>:5432/smooches"
	@echo "     SESSION_SECRET=$$SESSION_SECRET"
	@echo "     S3_BUCKET=smooches-media-<AWS_ACCOUNT_ID>"
	@echo "     DISPATCH_INGEST_HOST=$${DISPATCH_INGEST_HOST:-<your-ingest-service>}"
	@echo "     OPENAI_API_KEY=$${OPENAI_API_KEY:-}"
	@echo "     STRIPE_SECRET_KEY=$${STRIPE_SECRET_KEY:-}"
	@echo ""
	@echo "Then run: make migrate"

# Database
migrate:
	@if [ -z "$$DATABASE_URL" ]; then \
		echo "❌ Set DATABASE_URL env var"; exit 1; \
	fi
	npx drizzle-kit push

db-studio:
	npx drizzle-kit studio

# Utils
logs:
	@if [ -z "$$STACK_NAME" ]; then \
		echo "Usage: make logs STACK_NAME=smooches-infrastructure"; exit 1; \
	fi
	aws logs tail /ecs/$$STACK_NAME --follow --region $${AWS_REGION:-us-east-1}

clean:
	rm -rf dist node_modules
	docker rmi smooches:latest || true
	docker image prune -f