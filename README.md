# Scrum Poker API

<img width="1139" height="429" alt="og-image" src="https://github.com/user-attachments/assets/945c70d8-d520-484a-ab86-849f72ff457b" />

A powerful and modern API for Scrum Poker planning sessions, built with NestJS, TypeScript, and real-time WebSocket communication.

## 🚀 Features

- **Real-time Communication**: WebSocket integration for instant updates across all connected clients
- **Room Management**: Create, join, and manage planning poker rooms
- **User Management**: Handle user authentication and session management
- **Voting System**: Complete voting mechanism with card reveal functionality
- **Member Management**: Control room access with accept/refuse mechanisms
- **Geolocation Support**: Location-based room discovery
- **RESTful API**: Well-structured REST endpoints for all operations
- **Database Integration**: PostgreSQL with Prisma ORM
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive test suite with Vitest
- **Docker Support**: Ready-to-deploy Docker configuration

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Real-time**: [Socket.IO](https://socket.io/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Validation**: [class-validator](https://github.com/typestack/class-validator)
- **Documentation**: Swagger/OpenAPI
- **Containerization**: [Docker](https://www.docker.com/)

## 📋 Prerequisites

- Node.js 18.x or higher
- PostgreSQL 12.x or higher
- Docker (optional, for containerized development)

## 🚀 Getting Started

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/igorssc/scrum-poker-api.git
cd scrum-poker-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=dev
APP_PORT=3000

POSTGRES_USERNAME=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=scrum_poker_db

POSTGRES_URL=postgresql://username:password@localhost:5432/scrum_poker_db
```

### Database Setup

1. Run database migrations:
```bash
npx prisma migrate dev
```

2. Generate Prisma client:
```bash
npx prisma generate
```

### Running the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

#### Using Docker
```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Rooms Endpoints

- `GET /rooms/location` - Find rooms by location
- `GET /rooms/:roomId` - Get room details
- `POST /rooms` - Create new room
- `PATCH /rooms/:roomId` - Update room
- `DELETE /rooms/:roomId` - Delete room

### Room Member Actions

- `POST /rooms/:roomId/sign-in` - Join room
- `POST /rooms/:roomId/sign-in/accept` - Accept member (owner only)
- `POST /rooms/:roomId/sign-in/refuse` - Refuse member (owner only)
- `POST /rooms/:roomId/sign-out` - Leave room

### Voting Actions

- `POST /rooms/:roomId/vote` - Submit vote
- `POST /rooms/:roomId/vote/reveal` - Reveal all votes
- `POST /rooms/:roomId/vote/clear` - Clear all votes

### Users Endpoints

- `PATCH /users/:userId` - Update user profile

## 🔌 WebSocket Events

The API supports real-time communication through WebSocket events:

- `sign-in` - User joins room
- `sign-out` - User leaves room
- `sign-in-accept` - Member accepted
- `sign-in-refuse` - Member refused
- `vote-member` - New vote submitted
- `votes-revealed` - Votes revealed
- `clear-votes` - Votes cleared
- `update-room` - Room updated
- `delete-room` - Room deleted

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

## 🏗️ Project Structure

```
src/
├── application/           # Business logic layer
│   ├── errors/           # Error constants
│   ├── providers/        # External service providers
│   ├── repositories/     # Data access layer
│   ├── use-cases/        # Business use cases
│   └── utils/            # Utility functions
├── infra/                # Infrastructure layer
│   ├── controllers/      # HTTP controllers
│   ├── decorators/       # Custom decorators
│   ├── dtos/            # Data transfer objects
│   ├── enums/           # Enums and constants
│   ├── http/            # HTTP module configuration
│   └── websockets/      # WebSocket implementation
├── prisma/              # Database schema and migrations
├── app.module.ts        # Main application module
└── main.ts             # Application entry point
```

## 🔧 Development Scripts

- `npm run build` - Build the application
- `npm run start:dev` - Start in development mode
- `npm run start:debug` - Start in debug mode
- `npm run lint` - Lint the code
- `npm run format` - Format the code
- `npm run migrate:dev` - Run database migrations

## 🌍 Frontend Application

This API powers the **Scrum Poker** frontend application. Check out the complete planning poker experience:

🔗 **Frontend Repository**: [https://github.com/igorssc/scrum-poker](https://github.com/igorssc/scrum-poker)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Igor Santos**

- GitHub: [@igorssc](https://github.com/igorssc)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Inspired by Scrum planning poker methodology
- Thanks to the open-source community

---

⭐ If you found this project helpful, please give it a star on GitHub!
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
