# PrintMe Admin Dashboard - Backend Setup

Complete backend API server with Docker, NGINX, and MariaDB integration.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
# Start the entire stack (database, backend, frontend, nginx)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the stack
docker-compose down
```

### Option 2: Development Mode
```bash
# Start backend only (requires MariaDB running separately)
cd backend
npm run dev
```

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for development)
- MariaDB container running (if not using Docker Compose)

## 🏗️ Architecture

```
NGINX (Port 80) 
├── Frontend (React) → http://localhost:3000
├── Backend API → http://localhost:3001/api
└── Static Files → http://localhost:3001/uploads
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=chris
DB_PASSWORD=AvaHazel2020!
DB_NAME=PrintMe

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=ttf,otf,woff,woff2

# CORS
FRONTEND_URL=http://localhost:3000
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Fonts
- `GET /api/fonts` - Get all fonts
- `GET /api/fonts/:id` - Get font by ID
- `POST /api/fonts` - Create new font
- `POST /api/fonts/upload` - Upload font file
- `DELETE /api/fonts/:id` - Delete font

### Items
- `GET /api/items` - Get all production items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID

## 🗄️ Database Schema

The backend automatically connects to your MariaDB database using the schema in `database/schema.sql`.

### Tables Created:
- `users` - User accounts and roles
- `items` - Production items catalog
- `customers` - Customer information
- `orders` - Print orders
- `order_items` - Order line items
- `templates` - Print templates
- `fonts` - Custom uploaded fonts

## 📁 File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Database connection
│   ├── routes/
│   │   ├── fonts.ts         # Font API endpoints
│   │   ├── items.ts         # Items API endpoints
│   │   ├── dashboard.ts     # Dashboard API endpoints
│   │   └── orders.ts        # Orders API endpoints
│   ├── services/
│   │   └── database.ts      # Database service layer
│   └── server.ts            # Main Express server
├── uploads/                 # File upload directory
├── Dockerfile              # Docker configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build -d

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
docker-compose logs nginx

# Restart a service
docker-compose restart backend

# Scale services
docker-compose up --scale backend=2

# Clean up
docker-compose down -v  # Removes volumes too
```

## 🔍 Testing the API

### Health Check
```bash
curl http://localhost/api/health
```

### Get Fonts
```bash
curl http://localhost/api/fonts
```

### Upload Font
```bash
curl -X POST -F "font=@your-font.ttf" http://localhost/api/fonts/upload
```

## 🛠️ Development

### Start Development Server
```bash
cd backend
npm run dev
```

### Build for Production
```bash
cd backend
npm run build
npm start
```

### Database Connection Test
The server automatically tests the database connection on startup and logs the results.

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API request limiting
- **File Validation** - Upload file type/size validation
- **Input Sanitization** - SQL injection prevention

## 📊 Monitoring

- Health check endpoint: `/api/health`
- Request logging with Morgan
- Error handling and logging
- Database connection monitoring

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if MariaDB is running
docker ps | grep mariadb

# Test database connection
docker exec -it printme-database mysql -u chris -p PrintMe
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Restart backend service
docker-compose restart backend
```

### File Upload Issues
```bash
# Check upload directory permissions
ls -la backend/uploads/

# Create upload directory if missing
mkdir -p backend/uploads/fonts
```

## 🔄 Updates

To update the backend:
1. Make changes to source code
2. Rebuild Docker image: `docker-compose build backend`
3. Restart services: `docker-compose up -d`

## 📝 API Response Format

### Success Response
```json
{
  "id": 1,
  "name": "example",
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

The backend is now fully configured and ready for production deployment with Docker and NGINX! 🎉
