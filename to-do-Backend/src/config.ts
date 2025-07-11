import { Error } from "mongoose";

import mongoose from "mongoose";
export function connectDB() {
  const url =
    "mongodb+srv://ramighazzawiabed:edsjBiv52nKCZG82@cluster0.skxywzc.mongodb.net/to-do-app";

  try {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_: any) => {
    console.log(`Database connected: ${url}`);
  });

  dbConnection.on("error", (err: Error) => {
    console.error(`connection error: ${err}`);
  });
  return;
}
