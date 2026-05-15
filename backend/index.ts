import app from "./src/app";
import { connectDatabase } from "./src/config/database";

const PORT = process.env.PORT || 3000;

// Connect to database first
connectDatabase()
  .then(() => {
    // Start server only after DB connects
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
