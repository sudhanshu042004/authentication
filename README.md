# Auth API

A simple authentication server built with Express and Bun, using JWT (via an HTTP-only cookie) and PostgreSQL (Drizzle ORM).

## Setup

- **Install dependencies:**
```bash
bun install
```

- **Environment variables (required):**
  - `JWT_SECRET`: Secret key for signing JWTs
  - `DATABASE_URL`: Postgres connection string (e.g. `postgresql://user:password@host:5432/dbname`)

- **Run the server:**
```bash
bun run index.ts
```

- **Base URL:** `http://localhost:3000`

- **Rate limiting:** 100 requests per 5 minutes per IP

- **Cookie used for auth:** `session` (HTTP-only JWT). Returned on successful signup/login and required for `/api/user` routes.

> Note: Google OAuth routes exist in the codebase, but this README intentionally omits them for now.

## Endpoints (non-Google)

### Health
- **GET** `/`
  - Response 200
    ```json
    { "message": "you have pinged the server" }
    ```

### Auth
- **POST** `/api/auth/signup`
  - Body
    ```json
    {
      "email": "user@example.com",
      "password": "8-16 chars",
      "name": "Your Name"
    }
    ```
  - Success 200
    ```json
    { "status": "success", "message": "usesr created successfully", "cookie": "<JWT>" }
    ```
    - Sets cookie: `session=<JWT>`
  - Errors
    - 400
      ```json
      { "status": "error", "message": "Invalid Credentials" }
      ```
    - 401
      ```json
      { "status": "error", "message": "Email already exists" }
      ```
    - 500
      ```json
      { "status": "error", "message": "something went wrong!!!" }
      ```

- **POST** `/api/auth/login`
  - Body
    ```json
    {
      "email": "user@example.com",
      "password": "8-16 chars"
    }
    ```
  - Success 200
    ```json
    { "status": "statusOk", "message": "successfully login", "cookie": "<JWT>" }
    ```
    - Sets cookie: `session=<JWT>`
  - Errors
    - 400
      ```json
      { "status": "error", "message": "Invalid Credentials" }
      ```
    - 404
      ```json
      { "status": "error", "message": "email doesn't exists" }
      ```
    - 401
      ```json
      { "status": "error", "message": "Invalid password" }
      ```
    - 500
      ```json
      { "status": "error", "message": "something went wrong!!!" }
      ```

### User (requires auth cookie)
Middleware `verifyUser` expects header: `Cookie: session=<JWT>`

- **GET** `/api/user`
  - Success 200
    ```json
    {
      "status": "statusOk",
      "message": "users data for <email>",
      "data": {
        "id": 1,
        "name": "Your Name",
        "email": "user@example.com",
        "avatar": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
  - Errors
    - 500
      ```json
      { "status": "error", "message": "error while geting user data" }
      ```
    - 401 (missing/invalid cookie)
      ```json
      { "status": "error", "message": "invalid token" }
      ```

- **PUT** `/api/user`
  - Body (all fields optional)
    ```json
    {
      "name": "New Name",
      "avatar": "https://example.com/avatar.png"
    }
    ```
  - Success 200
    ```json
    { "status": "statusOk", "message": "successfully updated user profile" }
    ```
  - Errors
    - 400
      ```json
      { "status": "error", "message": "invalid input" }
      ```
    - 500
      ```json
      { "status": "error", "message": "something went wrong" }
      ```
    - 401 (missing/invalid cookie)
      ```json
      { "status": "error", "message": "invalid token" }
      ```

- **DELETE** `/api/user`
  - Success 200
    ```json
    { "status": "statusOK", "message": "user of id <id> deleted successfully" }
    ```
  - Errors
    - 401
      ```json
      { "status": "error", "message": "unauthorize access" }
      ```

## cURL Examples

- Signup
```bash
curl -i -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"User"}' \
  -c cookies.txt
```

- Login
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

- Get Profile
```bash
curl -s http://localhost:3000/api/user \
  -b cookies.txt
```

- Update Profile
```bash
curl -s -X PUT http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","avatar":"https://example.com/avatar.png"}' \
  -b cookies.txt
```

- Delete Account
```bash
curl -s -X DELETE http://localhost:3000/api/user \
  -b cookies.txt
```

## Validation Rules
- **email**: valid email
- **password**: string, length 8–16
- **update fields**: `name` (string, optional), `avatar` (string, optional)

## Notes
- Ensure `JWT_SECRET` is set before using signup/login.
- Cookies are HTTP-only; with curl, use `-c` to save and `-b` to send cookies.
- Ensure your PostgreSQL database is reachable via `DATABASE_URL` and required tables exist (per Drizzle schema).