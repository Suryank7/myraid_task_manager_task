# TaskForge API Documentation

All endpoints receive and return `application/json` payloads. Requests to `/api/tasks/*` require an active session cookie.

## Auth Endpoints

### `POST /api/auth/register`
Creates a new user account.
- **Body**: `{ "name": "string", "email": "string", "password": "string" }`
- **Response**: `201 Created` | `{ "user": { "id", "email", "name", "role" } }`
- **Notes**: Sets `accessToken` and `refreshToken` cookies.

### `POST /api/auth/login`
Authenticates a user.
- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: `200 OK` | `{ "user": { ... } }`
- **Notes**: Sets `accessToken` and `refreshToken` cookies.

### `POST /api/auth/refresh`
Issues a new access token based on valid refresh token cookie.
- **Response**: `200 OK` | `{ "message": "Token refreshed successfully" }`

### `POST /api/auth/logout`
Destroys session.
- **Response**: `200 OK` | `{ "message": "Logged out successfully" }`
- **Notes**: Clears HTTP-only cookies.

### `GET /api/auth/me`
Retrieves current session user.
- **Response**: `200 OK` | `{ "user": { ... } }`

---

## Tasks Endpoints

### `GET /api/tasks`
Fetches a paginated, filtered, and sorted list of tasks.
- **Query Params**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string)
  - `status` ('TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED')
  - `priority` ('LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
  - `sortBy` (string, default: 'createdAt')
  - `sortOrder` ('asc' | 'desc')
- **Response**: `200 OK` | `{ "data": [Task], "meta": { "total", "page", "limit", "totalPages" } }`

### `POST /api/tasks`
Creates a new task.
- **Body**: `{ "title", "description", "status", "priority", "dueDate" }`
- **Response**: `201 Created` | `{ "data": Task }`
- **Notes**: Description field will be AES-256 encrypted automatically before DB storage.

### `GET /api/tasks/:id`
Retrieves a single task and its activity history.
- **Response**: `200 OK` | `{ "data": Task }`

### `PUT /api/tasks/:id`
Updates task fields.
- **Body**: `{ "title"?, "description"?, "status"?, "priority"?, "dueDate"? }`
- **Response**: `200 OK` | `{ "data": Task }`

### `DELETE /api/tasks/:id`
Soft-deletes a task.
- **Response**: `200 OK` | `{ "message": "Task deleted successfully" }`
