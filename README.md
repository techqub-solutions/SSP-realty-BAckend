# SSP Realty Backend API

Modern Express.js backend for SSP Realty application.

## Quick Start

```bash
npm install
npm run dev
```

Server runs on: http://localhost:3000

## Environment Setup

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/ssp-realty
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property by ID
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Team
- `GET /api/team` - Get all team members
- `POST /api/team` - Create team member
- `DELETE /api/team/:id` - Delete team member

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts

## Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- Express.js
- MongoDB + Mongoose
- TypeScript
- CORS
