const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/user-routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max requests per windowMs
});
app.use(limiter);

app.use("/api", router);

mongoose
  .connect(
    `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.nrlaqu0.mongodb.net/auth?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
    console.log("Database is connected! Listening to localhost 5000");
  })
  .catch((err) => console.log(err));
