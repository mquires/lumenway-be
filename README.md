## Project Documentation

### Project Structure

```text
src/
├── app/ # Application core
│ ├── config/ # Configuration files
│ ├── graphql/ # GraphQL configuration and plugins
│ ├── prisma/ # Prisma client and configuration
│ └── redis/ # Redis configuration and services
├── modules/ # Feature modules
│ └── [feature]/ # Feature-specific folders
│ ├── inputs/ # Input types and args
│ ├── types/ # GraphQL object types
│ └── resolvers/ # GraphQL resolvers
├── shared/ # Shared code
│ ├── decorators/ # Custom decorators
│ ├── guards/ # Authorization guards
│ └── types/ # Shared types
└── main.ts # Application entry point
```

### Key Features

- **GraphQL API**: Built using NestJS and Apollo Server integration
- **Database Integration**: PostgreSQL database integration using TypeORM
- **Authentication**: Cookie-based authentication system with session management
- **Authorization**: Role-based access control (RBAC)
- **Validation**: Input validation using class-validator
- **Documentation**: GraphQL Playground and schema documentation
- **Error Handling**: Global error handling and custom exceptions
- **Logging**: Built-in logging system
- **Configuration**: Environment-based configuration using dotenv

### API Documentation

The GraphQL Playground is available at `/graphql` when running the application in development mode. It provides an interactive environment to explore the API schema, available queries and mutations, and test requests. The documentation includes:

- Schema definition
- Available queries and mutations
- Type definitions
- Input types
- Authentication requirements

### Environment Variables

Create a `.env` file in the root directory using `.env.example`:

### Development Guidelines

- Follow the NestJS best practices and coding standards
- Write unit tests for new features
- Update API documentation when adding new endpoints
- Use TypeScript decorators for dependency injection
- Follow the modular architecture pattern

### Getting Started

1. Start the infrastructure services using Docker:

```bash
docker compose up -d --build
```

2. Start the application:

```bash
# Development mode with hot-reload
yarn start:dev
```
