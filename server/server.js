const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

const allowecOrigins = ["http://localhost:5173"];
const app = express();
app.use(cors({ origin: allowecOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.listen(3000);
