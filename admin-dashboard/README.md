# PrintMe Admin Dashboard

A modern React-based admin dashboard for print production management with MariaDB integration.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 📊 Dashboard with real-time statistics
- 🖨️ Print production management (Items, Orders, Products)
- 👥 User management with roles and permissions
- 📈 Analytics and reporting
- 🎯 Personalization settings (Fonts, Colors, Templates)
- 🗄️ MariaDB database integration

## Database Setup

### Prerequisites
- MariaDB running in Docker container
- Database: `PrintMe`
- User: `chris`
- Password: `AvaHazel2020!`

### 1. Initialize Database Schema
Run the SQL schema file in your MariaDB container:

```bash
# Copy schema to container (if needed)
docker cp database/schema.sql your-mariadb-container:/tmp/schema.sql

# Execute schema in container
docker exec -it your-mariadb-container mysql -u chris -p PrintMe < /tmp/schema.sql
```

### 2. Environment Configuration
The `.env` file is already configured with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=chris
DB_PASSWORD=AvaHazel2020!
DB_NAME=PrintMe
```

### 3. Test Database Connection
The app will automatically test the database connection on startup and log the results to the console.

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── MainContent.tsx # Main content area
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Fonts.tsx      # Font settings
│   └── Items.tsx      # Items management
├── config/             # Configuration files
│   └── database.ts    # Database configuration
├── services/           # Business logic services
│   └── database.ts    # Database service layer
└── utils/              # Utility functions
    └── dbTest.ts      # Database testing utilities
```

## Database Services

### Available Services

- **DatabaseService**: Generic database operations (CRUD)
- **PrintService**: Print-specific operations (items, orders, stats)

### Example Usage

```typescript
import { PrintService } from './services/database';

// Get all items
const items = await PrintService.getAllItems();

// Get dashboard statistics
const stats = await PrintService.getDashboardStats();

// Create new item
const itemId = await PrintService.createItem({
  name: 'Business Cards',
  category: 'Print',
  price: 25.00,
  stock: 100
});
```

## Database Tables

- **users**: User accounts and roles
- **items**: Production items catalog
- **customers**: Customer information
- **orders**: Print orders
- **order_items**: Order line items
- **templates**: Print templates

## Security Notes

- Database credentials are stored in `.env` file
- `.env` file is excluded from git via `.gitignore`
- Connection pooling is implemented for performance
- Prepared statements prevent SQL injection

## Development

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- MySQL2 for database connectivity
- Environment-based configuration

## Next Steps

1. Test database connection
2. Implement API endpoints
3. Connect frontend components to database
4. Add authentication system
5. Implement real-time updates
