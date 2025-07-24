const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/authRoutes");

const app = express();
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use("/api/v1/auth", authRouter);

app.listen(3000);
