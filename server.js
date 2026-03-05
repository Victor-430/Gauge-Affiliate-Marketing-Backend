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

const isProduction = process.env.NODE_ENV === "production";

// const allowedOrigins = isProduction
//   ? [process.env.CLIENT_URL]
//   : ["http://localhost:5173"]




console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("Allowed Origins:", allowedOrigins);

// const corsOptions = {
 
//     origin: (origin, callback) => {
//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error(`CORS blocked: origin "${origin}" not allowed`));
//       }
//     },
//   }

const corsOptions = {
  origin: "https://affiliate.gaugesolution.com",
    credentials: true,
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));


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

// app.get("/health", async (req, res) => {
//   const health = {
//     status: "ok",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV || "development",
//   };

//   res.status(200).json(health);
// });

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

