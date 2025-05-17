# EventBooking App

A full-stack application for event booking and management, built with .NET Core backend and Angular frontend.

## Project Overview

EventBooking App allows users to browse, search, and book events. Event organizers can create and manage events, track bookings, and engage with attendees.

## Repository Structure

```
EventBooking-App/
├── EventBooking-Backend/      # .NET Core Backend
│   ├── EventBooking.Api/      # API Controllers & Configuration
│   ├── EventBooking.DB/       # Database Context & Models
│   ├── EventBooking.Repository/  # Data Access Layer
│   ├── EventBooking.Service/  # Business Logic Layer
│   └── EventBooking.UnitOfWork/  # Unit of Work Pattern Implementation
└── EventBooking-Frontend/     # Angular Frontend
    ├── src/                   # Source code
    ├── public/                # Static assets
    └── ...                    # Configuration files
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or SQL Server Express)

## Backend Setup (EventBooking-Backend)

### Database Configuration

1. Open `EventBooking-Backend/EventBooking.Api/appsettings.json` and update the connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SQL_SERVER;Database=EventBookingDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

### Running Migrations

1. Navigate to the API project directory:

```powershell
cd d:\projects\.Net\projects\EventBooking-App\EventBooking-Backend\EventBooking.Api
```

2. Apply database migrations:

```powershell
dotnet ef database update
```

### Running the Backend

1. Navigate to the API project directory:

```powershell
cd d:\projects\.Net\projects\EventBooking-App\EventBooking-Backend\EventBooking.Api
```

2. Run the project:

```powershell
dotnet run
```

The API will be available at `https://localhost:5263` (HTTP: `http://localhost:5262`).

### API Documentation

Once the backend is running, you can access the Swagger documentation at:
`https://localhost:5263/swagger`

## Frontend Setup (EventBooking-Frontend)

### Installing Dependencies

1. Navigate to the frontend directory:

```powershell
cd d:\projects\.Net\projects\EventBooking-App\EventBooking-Frontend
```

2. Install the dependencies:

```powershell
npm install
```

### Environment Configuration

The frontend uses environment files to configure API endpoints:

- For development: `src/environments/environment.ts`
- For production: `src/environments/environment.prod.ts`

Make sure the `apiUrl` in `environment.ts` matches your backend URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5263',
  appName: 'Event Booking App',
  mockApi: false
};
```

### Running the Frontend

1. Start the development server:

```powershell
ng serve
```

2. Open your browser and navigate to `http://localhost:4200/`

## Building for Production

### Backend

```powershell
cd d:\projects\.Net\projects\EventBooking-App\EventBooking-Backend\EventBooking.Api
dotnet publish -c Release
```

The published files will be in the `bin/Release/net8.0/publish/` directory.

### Frontend

```powershell
cd d:\projects\.Net\projects\EventBooking-App\EventBooking-Frontend
ng build --configuration production
```

The built project will be in the `dist/event-booking-app/` directory.

## Deploying to Vercel (Frontend)

The Angular frontend is configured for deployment on Vercel:

1. Install Vercel CLI:

```powershell
npm install -g vercel
```

2. Deploy to Vercel:

```powershell
cd d:\projects\.Net\projects\EventBooking-App\EventBooking-Frontend
vercel --prod
```

3. Follow the prompts to complete the deployment process.

## Project Features

- User authentication and authorization
- Event browsing and searching
- Event booking and management
- User profile management
- Admin dashboard for event organizers
- Reviews and ratings for events

## Tech Stack

### Backend
- ASP.NET Core 8
- Entity Framework Core
- SQL Server
- JWT Authentication

### Frontend
- Angular 19
- Angular Material UI
- SCSS for styling
- RxJS for reactive programming

## Development Guidelines

### Code Style

- Follow Angular style guide for frontend
- Follow Microsoft's C# coding conventions for backend

### Git Workflow

1. Create feature branches from `develop`
2. Submit pull requests to merge into `develop`
3. Main releases are merged from `develop` into `main`

## License

[MIT License](LICENSE)

## Contributors

- Project developed by EventBooking Team
