import dotenv from "dotenv";
import { app } from "./app.js";

// Initialize environment variables explicitly
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3000;

// Future: Database Connection Logic will go here.
// Once DB connects successfully, we start the server.

app.listen(PORT, () => {
  console.log(`⚙️  Server is running at port : ${PORT}`);
});
