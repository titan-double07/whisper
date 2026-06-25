import app from "./src/app";
import { connectDatabase } from "./src/config/database";
import { createServer } from "http";
import { initializeSocket } from "./src/utils/socket";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Initialize socket.io
initializeSocket(httpServer);

// Connect to database first
connectDatabase()
  .then(() => {
    // Start server only after DB connects
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
