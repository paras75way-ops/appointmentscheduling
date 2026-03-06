import app from "./app";
import dotenv from "dotenv";
import connectDB from "./config/db.connect";
import { startReminderWorker } from "./workers/reminderemail.worker";
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();   
startReminderWorker();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error); 
    process.exit(1);
  }
};

startServer();