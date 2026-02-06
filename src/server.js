import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import emailRoutes from './routes/email.js'

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

// Body parser
app.use(json());

app.use("/api/email", emailRoutes);

const Port = process.env.PORT || 3000

app.listen(Port, () => {
    console.log("Running on prot", {Port})
})
