# Backend API

RESTful API for the Monorepo Template application, built with Koa, TypeScript,
and MongoDB.

## Features

- 🚀 **Koa.js Framework**: Lightweight and modern Node.js framework
- 📚 **Book/Library CRUD API**: Complete RESTful API for managing books
- 🗄️ **MongoDB with Mongoose**: Document-based database with ODM
- ✅ **Input Validation**: Using Zod schemas for type-safe validation
- 📝 **API Documentation**: OpenAPI/Swagger documentation
- 🧪 **Testing**: Comprehensive test suite with Vitest
- 🔒 **TypeScript**: Full type safety throughout the codebase
- 🎨 **Code Quality**: ESLint and Prettier for consistent code style

## Prerequisites

- Node.js >= 20.0.0 (tested with Node.js 20.x and 24.x)
- pnpm >= 9.0.0
- Docker (for MongoDB)

## Environment Variables

Environment variables are configured in the centralized `environments/` folder
at the repository root. See
[environments/README.md](../../environments/README.md) for detailed setup
instructions.

| Variable       | Description               | Default                                       |
| -------------- | ------------------------- | --------------------------------------------- |
| `NODE_ENV`     | Node environment          | `development`                                 |
| `BACKEND_PORT` | Server port               | `3000`                                        |
| `MONGODB_URI`  | MongoDB connection string | `mongodb://localhost:27017/monorepo-template` |
| `CORS_ORIGIN`  | Allowed CORS origin       | `http://localhost:4000`                       |
| `DEBUG`        | Enable debug mode         | `true`                                        |

Example configuration (from `environments/.env.example`):

```env
NODE_ENV=development
BACKEND_PORT=3000
MONGODB_URI=mongodb://localhost:27017/monorepo-template
CORS_ORIGIN=http://localhost:4000
DEBUG=true
ENV=dev
```

## Quick Start

### 1. Setup Environment

Configure environment variables in the centralized `environments/` folder:

```bash
# From the repository root
cp environments/.env.example environments/.env.dev

# Edit the file with your configuration
```

See [environments/README.md](../../environments/README.md) for details.

### 2. Start MongoDB

From the repository root:

```bash
pnpm db:start
```

This will start MongoDB in a Docker container on port 27017.

### 3. Install Dependencies

Dependencies are installed from the root:

```bash
cd ../..
pnpm install
```

### 4. Start Development Server

From the repository root:

```bash
pnpm be:dev
```

The API will be available at http://localhost:3000

## Available Scripts

Run these from the **repository root**:

- `pnpm be:dev` - Start development server with hot reload
- `pnpm be:build` - Build the application
- `pnpm be:start` - Start production server
- `pnpm be:test` - Run tests in watch mode
- `pnpm be:test:coverage` - Run tests with coverage
- `pnpm be:lint` - Lint and fix code
- `pnpm be:format` - Format code with Prettier
- `pnpm be:type-check` - Type check without building

### Database Scripts

- `pnpm db:start` - Start MongoDB container
- `pnpm db:stop` - Stop MongoDB container

### Full Stack Development

To run both frontend and backend together:

```bash
pnpm dev
```

This will:

1. Start MongoDB
2. Start the backend on port 3000
3. Start the frontend on port 5173

## API Endpoints

### Books

All book endpoints are prefixed with `/api/books`

#### Get All Books

```http
GET /api/books?page=1&limit=10&genre=Fiction&author=Tolkien&available=true
```

Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `genre` (optional): Filter by genre
- `author` (optional): Filter by author (case-insensitive partial match)
- `available` (optional): Filter by availability (true/false)

Response:

```json
{
  "data": [
    {
      "_id": "...",
      "title": "The Lord of the Rings",
      "author": "J.R.R. Tolkien",
      "isbn": "978-0-395-19395-6",
      "publishedYear": 1954,
      "genre": "Fantasy",
      "description": "Epic fantasy novel...",
      "available": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### Get Book by ID

```http
GET /api/books/:id
```

#### Create Book

```http
POST /api/books
Content-Type: application/json

{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "isbn": "978-0-618-00221-3",
  "publishedYear": 1937,
  "genre": "Fantasy",
  "description": "A fantasy novel and children's book...",
  "available": true
}
```

#### Update Book

```http
PUT /api/books/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "available": false
}
```

#### Delete Book

```http
DELETE /api/books/:id
```

### Health Check

```http
GET /health
```

### API Documentation

```http
GET /api/docs
```

## Environment Configuration

Environment variables are managed in the centralized `environments/` directory
at the repository root. All environment files should be placed there, not in the
app directory.

Quick setup:

```bash
# Copy the example file
cp environments/.env.example environments/.env.dev

# Edit with your configuration
# See environments/README.md for all available variables
```

## Project Structure

```
apps/Server.API/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts     # Main config
│   │   └── database.ts  # Database connection
│   ├── controllers/      # Route controllers
│   │   └── bookController.ts
│   ├── middleware/       # Custom middleware
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── models/          # Mongoose models
│   │   └── Book.ts
│   ├── routes/          # API routes
│   │   └── bookRoutes.ts
│   ├── types/           # TypeScript types & schemas
│   │   └── book.schemas.ts
│   └── index.ts         # Application entry point
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── README.md
```

## Development

### Adding a New Entity

1. Create a model in `src/models/`
2. Create validation schemas in `src/types/`
3. Create a controller in `src/controllers/`
4. Create routes in `src/routes/`
5. Register routes in `src/index.ts`
6. Write tests

### Testing

Tests are located next to the files they test with a `.test.ts` extension.

```bash
# Run tests
pnpm be:test

# Run with coverage
pnpm be:test:coverage
```

### Code Quality

Before committing, ensure your code passes all checks:

```bash
pnpm be:lint
pnpm be:format
pnpm be:type-check
pnpm be:test
```

## Error Handling

The API uses a global error handler that catches and formats errors:

- **Validation Errors (400)**: When request data doesn't match schema
- **Not Found (404)**: When a resource doesn't exist
- **Duplicate Key (409)**: When trying to create a duplicate (e.g., same ISBN)
- **Internal Server Error (500)**: For unexpected errors

Example error response:

```json
{
  "error": "Validation Error",
  "details": [
    {
      "path": "title",
      "message": "Title is required"
    }
  ]
}
```

## Technologies

- **Koa.js**: Web framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **Zod**: Schema validation
- **Vitest**: Testing framework
- **ESLint**: Linting
- **Prettier**: Code formatting
- **tsx**: TypeScript execution for development

## License

Part of the Monorepo Template monorepo.
