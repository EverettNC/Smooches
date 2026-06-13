# SMOOCHES Social Media Platform

A comprehensive social media platform for content creators featuring video sharing, radio stations, live streaming, and monetization through the Ambassador Program.

## Features

- **Video Content**: 3-5 minute videos with likes, comments, and gifting
- **Radio Stations**: Schedule and broadcast audio content 
- **Live Streaming**: Interactive real-time content with chat + gifting
- **Ambassador Program**: Integration with Amazon Prime features + podcast distribution for top creators
- **Monetization**: Earnings dashboard, subscription management, gifting. **Creator-first 85% revenue share** — no exploitation
- **Upward Integration**: All creator flows dispatch to central registry (traceable, governed) after core work

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
PORT=8030
```

## API Endpoints

### Core
- `GET /api/health` - Health check

### Creator API (port 8030 focus)
- `GET /smooches/identity` - Current creator identity + earnings/sub count + 85% cut info
- `POST /smooches/video` - Upload 3-5min video or radio audio (with duration focus)
- `POST /smooches/live` - Start live stream + gifting support
- `POST /smooches/ambassador` - Enroll in Ambassador Program (Amazon Prime + podcast distribution), manage subs/earnings

All /smooches/* flows perform core work (detect/extract/verify/post/gift) then strict upward POST to http://127.0.0.1:8000/source/ingest with trace_id + from:"smooches" (see DISPATCH.md). Flow completes only on ingest success.

Legacy /api/* endpoints remain for compatibility (videos, radio, auth, earnings, etc.).

## Database Schema

The platform uses PostgreSQL with tables for:
- Users and authentication
- Videos and comments
- Radio stations and schedules
- Transactions and earnings
- Live streams and reactions

## Production Notes

- Uses Fargate for containerized deployment (port 8030)
- RDS PostgreSQL for data persistence
- Application Load Balancer for high availability
- CloudWatch for logging and monitoring
- ECR for container image storage
- Strict creator revenue enforcement (85%) and upward dispatch to central ingest service per DISPATCH.md

## Security

- Password hashing with bcrypt
- Secure session management
- Environment-based configuration
- Database encryption at rest
- HTTPS/TLS termination at load balancer