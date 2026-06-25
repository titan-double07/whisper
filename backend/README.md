# Whisper Backend

This backend serves the Whisper chat application, handling user authentication, data persistence, and real-time communication via WebSockets.

## 1. Project Structure

A brief overview of the key directories:

-   **/src/models**: Defines the Mongoose schemas for our database collections (`User`, `Chat`, `Message`).
-   **/src/controllers**: Contains the business logic for handling API requests.
-   **/src/routes**: Defines the API endpoints and maps them to their respective controller functions.
-   **/src/middleware**: Custom middleware functions, such as for handling authentication or errors.
-   **/src/utils**: Utility functions, most notably the WebSocket implementation in `socket.ts`.
-   **index.ts**: The entry point for the application, where the server is configured and started.

## 2. Getting Started

Instructions for setting up and running the project locally.

1.  **Install dependencies:**
    ```bash
    bun install
    # or npm install
    ```
2.  **Environment Variables:**
    Create a `.env` file in the `backend` root and add the necessary variables (e.g., `DATABASE_URL`, `CLERK_SECRET_KEY`, `FRONTEND_URL`).
3.  **Run the server:**
    ```bash
    bun run dev
    # or npm run dev
    ```

## 3. API Endpoints

A summary of the core RESTful API routes.

-   **Auth Routes (`/api/auth`)**
    -   `POST /api/auth/register`: Creates a new user.
-   **User Routes (`/api/users`)**
    -   `GET /api/users`: Fetches a list of users.
-   **Chat Routes (`/api/chats`)**
    -   `POST /api/chats`: Creates a new chat.
    -   `GET /api/chats`: Gets all chats for the logged-in user.

## 4. Real-time Layer (WebSockets)

This is the most critical section for documenting `socket.ts`. It details the real-time communication flow.

### Connection

A client connects by sending a valid Clerk JWT with the `auth.token` payload during the socket handshake.

### Server-to-Client Events (`emit`)

Events the server sends to the client.

| Event | Payload | Description |
| :--- | :--- | :--- |
| `online-users` | `string[]` | An array of user IDs for all currently online users. Sent once on connection. |
| `user-online` | `string` | The ID of a user who has just come online. |
| `user-offline`| `string` | The ID of a user who has just disconnected. |
| `new-message` | `IMessage` | A new message object. Emitted to an active chat room (`chat:${chatId}`). |
| `new-message-notification` | `IMessage` | A new message object. Emitted to a user's private room (`user:${userId}`) for notifications. |
| `typing` | `{ userId, chatId, isTyping }` | Informs clients that a user is typing in a specific chat. |
| `socket-error`| `{ message }` | Sent when a recoverable error occurs. |

### Client-to-Server Events (`on`)

Events the client sends to the server.

| Event | Payload | Description |
| :--- | :--- | :--- |
| `join-chat` | `string` (chatId) | Tells the server the user wants to listen to a specific chat room. |
| `leave-chat` | `string` (chatId) | Tells the server the user is leaving a specific chat room. |
| `send-message`| `{ chatId, text }` | Sends a new chat message. |
| `typing` | `{ chatId, isTyping }` | Sent when a user starts or stops typing. |
