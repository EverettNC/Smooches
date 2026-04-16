# SMOOCHES Social Media Platform

A comprehensive social media platform for content creators featuring video sharing, radio stations, live streaming, and monetization through the Ambassador Program.

## Features

- **Video Content**: 3-5 minute videos with likes, comments, and gifting
- **Radio Stations**: Schedule and broadcast audio content 
- **Live Streaming**: Interactive real-time content with chat
- **Ambassador Program**: Integration with Amazon Prime and podcast platforms
- **Monetization**: Earnings dashboard and subscription management

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Deployment on AWS

1. **Prerequisites**
   - AWS CLI configured
   - Docker installed
   - Set environment variables:
     ```bash
     export AWS_ACCOUNT_ID=your-account-id
     export DATABASE_PASSWORD=secure-password
     export SESSION_SECRET=secure-32-char-string
     ```

2. **Deploy Infrastructure**
   ```bash
   aws cloudformation create-stack \
     --stack-name smooches-infrastructure \
     --template-body file://aws-infrastructure.yml \
     --parameters ParameterKey=DatabasePassword,ParameterValue=$DATABASE_PASSWORD \
                  ParameterKey=SessionSecret,ParameterValue=$SESSION_SECRET \
     --capabilities CAPABILITY_IAM
   ```

3. **Deploy Application**
   ```bash
   ./aws-deploy.sh
   ```

## Authentication

- Regular user registration and login
- Admin access via quick login button on auth page
- Session-based authentication with PostgreSQL storage

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **Real-time**: WebSocket connections
- **Deployment**: Docker, AWS ECS, RDS, ALB

## Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=your-session-secret
PORT=5000
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/videos` - Get videos
- `POST /api/videos` - Upload video
- `GET /api/radio-stations` - Get radio stations
- `POST /api/radio-stations` - Create radio station

## Database Schema

The platform uses PostgreSQL with tables for:
- Users and authentication
- Videos and comments
- Radio stations and schedules
- Transactions and earnings
- Live streams and reactions

## Production Notes

- Uses Fargate for containerized deployment
- RDS PostgreSQL for data persistence
- Application Load Balancer for high availability
- CloudWatch for logging and monitoring
- ECR for container image storage

## Security

- Password hashing with bcrypt
- Secure session management
- Environment-based configuration
- Database encryption at rest
- HTTPS/TLS termination at load balancer