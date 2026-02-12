import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import emailRoutes from "./src/routes/email.js";
import createAdminRoutes from "./src/routes/createAdmin.js"
import getUserRoleRoutes from "./src/routes/getUserRole.js"
import admin from "firebase-admin";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

// Body parser
app.use(express.json());

// Initialize Firebase Admin with environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

export const db = admin.firestore();
export const auth = admin.auth();

// health check and server report

app.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };

  res.status(200).json(health);
});

app.use("/api", emailRoutes);
app.use("/api", createAdminRoutes);
app.use("/api", getUserRoleRoutes);


const Port = process.env.PORT || 3000;

app.listen(Port, () => {
  console.log(process.env.RESEND_API_KEY);
  console.log("Running on prot", { Port });
});
