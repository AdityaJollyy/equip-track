import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { app } from "./app.js";
import { connectDB } from "./db/index.js";

const PORT = process.env.PORT || 8000;

// Connect to Database, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚙️  Server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ PostgreSQL connection failed !!! ", err);
  });
