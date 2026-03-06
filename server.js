import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import emailRoutes from "./src/routes/email.js";
import createAdminRoutes from "./src/routes/createAdmin.js";
import getUserRoleRoutes from "./src/routes/getUserRole.js";
import leadsRoutes from "./src/routes/leads.js";
import admin from "firebase-admin";

dotenv.config();

const app = express();

// const isProduction = process.env.NODE_ENV === "production";

// const allowedOrigins = isProduction
//   ? [process.env.CLIENT_URL]
//   : ["http://localhost:5173"]

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CLIENT_URL:", process.env.CLIENT_URL);

const corsOptions = {
  origin: "https://affiliate.gaugesolution.com",
  credentials: true,
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

export const db = admin.firestore();
export const auth = admin.auth();

app.use("/associate", emailRoutes);
app.use("/admin", createAdminRoutes);
app.use("/role", getUserRoleRoutes);
app.use("/leads", leadsRoutes);

const Port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(Port, () => {
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Running on port", Port);
  });
}

export default app;
