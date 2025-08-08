import dotenv from "dotenv";
dotenv.config();
import prisma from "./db/index";
import { createServer } from "http";
import { app } from "./app";

const server = createServer(app);

prisma
  .$connect()
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
