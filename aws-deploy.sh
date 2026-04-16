#!/bin/bash

# SMOOCHES AWS Deployment Script
# Run this script to deploy to AWS ECS with RDS PostgreSQL

set -e

# Configuration
APP_NAME="smooches"
AWS_REGION="us-east-1"
ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"

echo "🚀 Starting SMOOCHES deployment to AWS..."

# Build and tag Docker image
echo "📦 Building Docker image..."
docker build -t ${APP_NAME}:latest .

# Login to ECR
echo "🔐 Logging into AWS ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO}

# Tag image for ECR
docker tag ${APP_NAME}:latest ${ECR_REPO}:latest
docker tag ${APP_NAME}:latest ${ECR_REPO}:$(date +%s)

# Push to ECR
echo "⬆️  Pushing image to ECR..."
docker push ${ECR_REPO}:latest
docker push ${ECR_REPO}:$(date +%s)

# Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service \
    --cluster ${APP_NAME}-cluster \
    --service ${APP_NAME}-service \
    --force-new-deployment \
    --region ${AWS_REGION}

echo "✅ Deployment complete! SMOOCHES is now live on AWS."
echo "🌐 Access your app at: https://${APP_NAME}.yourdomain.com"