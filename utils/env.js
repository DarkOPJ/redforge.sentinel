import dotenv from "dotenv";
dotenv.config();

const ENV = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  DOMAIN: process.env.DOMAIN || "localhost",
};

export default ENV;
