# Deno REST API

This is a simple REST API built with Deno for managing tasks. It uses an in-memory SQLite database for storage and Redis for caching. The major highlight of this project is the custom router.

## Custom Router

This project features a custom-built router that handles incoming requests, supports dynamic paths, and manages middleware.

### Features

- **Method-Based Routing:** Supports `GET`, `POST`, and `DELETE` methods.
- **Dynamic Path Matching:** Handles dynamic segments in paths (e.g., `/tasks/:id`).
- **CORS Support:** Configurable CORS headers for cross-origin requests.
- **Logging:** Logs incoming requests with status and severity levels.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Deno](https://deno.land/)
- [Redis](https://redis.io/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/your_project_name.git
   ```
2. Create a `.env` file in the root of the project and add the following:
    ```
    PORT=5000
    ```
3. Install dependencies
   ```sh
   deno cache --reload main.ts
   ```

### Running the application

```sh
deno task dev
```

The application will be running on `http://localhost:5000`.

## API Endpoints

The following endpoints are available:

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| GET    | /tasks        | Get all tasks        |
| GET    | /tasks/:id    | Get a single task    |
| POST   | /tasks        | Create a new task    |
| DELETE | /tasks/:id    | Delete a task        |

### `POST /tasks`

**Request Body:**

```json
{
  "title": "My new task",
  "description": "This is a description of my new task",
  "status": "pending",
  "dueDate": "2025-12-31T23:59:59.999Z"
}
```

## Project Structure

```
.
├── controllers
│   └── tasks.ts
├── main.ts
├── router
│   ├── router.ts
│   └── utils.ts
├── storage
│   ├── cache.ts
│   └── db.ts
├── tests
│   └── utils_test.ts
└── utils
    ├── common.ts
    └── models.ts
```

## Dependencies

- [Deno Standard Modules](https://deno.land/std)
- [deno-sqlite](https://deno.land/x/sqlite)
- [deno-redis](https://deno.land/x/redis)
