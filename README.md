# TaskForge

A secure, real-time productivity command center for modern teams. Built as a production-ready enterprise SaaS platform.

![TaskForge Dashboard](https://via.placeholder.com/1200x630.png?text=TaskForge+Command+Center)

## Features

- **Lovable UI**: Glassmorphism, Framer Motion transitions, and a premium Dark Mode design.
- **Advanced Task Engine**: Kanban board with drag-and-drop HTML5 APIs, List view, and deep Task Details pages (Edit, Delete, Activity Logs).
- **Interactive Calendar**: Drag-and-drop scheduling functionality mapping tasks directly to Calendar views.
- **Enterprise Security**: JWT with HTTP-only cookies, AES-256 data encryption for task descriptions, and Role-Based Access Control (RBAC).
- **Audit System**: Automatic activity tracking for task creation, updates, and deletions.
- **Modern Tech Stack**: Next.js App Router, Tailwind CSS, shadcn/ui, TanStack Query, and Prisma with **MongoDB**.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, shadcn/ui, Framer Motion, TanStack Query v5, Zod, React Hook Form
- **Backend**: Next.js Route Handlers (Serverless/Edge), Prisma ORM
- **Database**: MongoDB (Atlas recommended)
- **Security**: Jose (Edge-compatible JWT), bcrypt, AES-256-GCM encryption

---

## Quick Start & Setup Instructions

### 1. Requirements

- Node.js 18+
- A MongoDB Database (e.g., [MongoDB Atlas Free Cluster](https://www.mongodb.com/cloud/atlas))

### 2. Environment Variables

Create a `.env` file in the root based on the following:

```env
# MongoDB Connection String (Replace <password> and specify database name like /taskforge)
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskforge?retryWrites=true&w=majority"

# Generate a strong randomized secret for JWT tokens
JWT_SECRET="generate_a_strong_secret_key_here"

# AES-256 Encryption requires exactly 32 bytes
ENCRYPTION_KEY="must_be_exactly_32_bytes_long_for_aes_256!!!"
```

*(Note: `ENCRYPTION_KEY` must be exactly 32 bytes or the encryption service will throw an initialization error!)*

### 3. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 4. Database Setup

Using MongoDB with Prisma requires pushing the models directly to the database rather than running SQL migrations:

```bash
npx prisma generate
npx prisma db push
```

### 5. Running the App

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Architecture Explanation

TaskForge implements a robust Serverless architecture pattern customized for Next.js App Router:

1. **Authentication Flow:** User credentials are hashed via `bcrypt`. Logging in issues an Edge-compatible JWT signed by `jose`. This JWT is strictly attached to an `HTTP-only`, `secure`, `SameSite=Strict` cookie, preventing XSS token theft.
2. **Encryption Pipeline:** All sensitive fields (e.g., Task `description`) are intercepted before database insertion. The `lib/encryption.ts` service uses standard Node `crypto` with `aes-256-gcm` to cipher the payload. Read queries decrypt this payload server-side before serving via API. 
3. **Data Layer:** Prisma interacts with MongoDB, with all Primary Keys and Foreign Keys strictly mapped to `@db.ObjectId` configurations.
4. **State Management:** The frontend employs `TanStack Query (React Query)` for aggressive client-side caching, loading states, and remote data synchronization (invalidating caches automatically on task mutations).

---

## Sample API Request/Response Documentation

### `POST /api/tasks`
Create a new encrypted task securely.

**Request:**
```http
POST /api/tasks HTTP/1.1
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5c...

{
  "title": "Prepare Q3 Architecture Review",
  "description": "Include the MongoDB migration analysis and benchmark numbers.",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2024-11-20T12:00:00.000Z"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "64f1b2c9e4b09cf9321abcd1",
    "title": "Prepare Q3 Architecture Review",
    "description": "Include the MongoDB migration analysis and benchmark numbers.",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2024-11-20T12:00:00.000Z",
    "userId": "64f1a2c9e4b0ccf9321abcd3",
    "createdAt": "2024-10-10T14:32:01.000Z",
    "updatedAt": "2024-10-10T14:32:01.000Z",
    "deletedAt": null
  }
}
```

### `GET /api/tasks`
Retrieve paginated lists of tasks for the authenticated user, automatically decrypting the descriptions.

**Request:**
```http
GET /api/tasks?limit=10&page=1&status=TODO HTTP/1.1
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5c...
```

**Response (200 OK):**
```json
{
  "data": [
    {
       "id": "64f1b2c9e4b09cf9321abcd1",
       "title": "Prepare Q3 Architecture Review",
       "description": "Include the MongoDB migration analysis and benchmark numbers.",
       "status": "TODO",
       "priority": "HIGH",
       "dueDate": "2024-11-20T12:00:00.000Z"
       // ...
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## License

MIT
