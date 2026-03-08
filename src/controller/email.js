import { v4 as uuidv4 } from "uuid";
import { auth, db } from "../../server.js";
import admin from "firebase-admin";
import { resend } from "../config/resend.js";
import config from "../config/env.js";
import { getWelcomeEmail } from "../emails/welcome.js";

const sendWelcomeEmail = async (req, res, next) => {
  const generateUniqueCode = () => {
    const uuid = uuidv4();
    const firstSegment = uuid.split("-")[0];
    return `GAM${firstSegment.toUpperCase()}`;
  };

  try {
    const { idToken } = req.body;
    console.log(idToken);

    if (!idToken) {
      const error = new Error("ID token is required");
      console.log("token required");
      error.status = 400;
      throw error;
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Check if email is verified
    const userRecord = await auth.getUser(userId);

    if (!userRecord.emailVerified) {
      const error = new Error("Email not verified yet");
      error.status = 400;
      throw error;
    }

    const associateDoc = await db.collection("associates").doc(userId).get();

    if (!associateDoc.exists) {
      const error = new Error("Associate not found");
      error.status = 404;
      throw error;
    }

    const associate = associateDoc.data();

    // Check if already activated
    if (associate.status === "active" && associate.uniqueCode) {
      return res.status(200).json({
        success: true,
        message: "Account already activated",
        uniqueCode: associate.uniqueCode,
        affiliateLink: associate.affiliateLink,
      });
    }

    // Generate unique code and link
    const uniqueCode = generateUniqueCode();
    const affiliateLink = `${config.affiliateBaseUrl}/leads?ref=${uniqueCode}`;

    // Update associate document
    await db.collection("associates").doc(userId).update({
      uniqueCode: uniqueCode,
      affiliateLink: affiliateLink,
      status: "active",
      emailVerified: true,
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
   
    const { data, error } = await resend.emails.send({
      // for development 
      // from: "Gauge <delivered@resend.dev>",
      // to: ["victor@gaugesolution.com"],
      
      // for production
      from: "Gauge Solution <noreply@gaugesolution.com>",
      to: [associate.email],
      subject: "Welcome to Gauge Affiliate Program",
      html: getWelcomeEmail(associate, affiliateLink, uniqueCode)
    });

    if (error) {
      console.error("Resend error:", error);
      const err = new Error("Failed to send welcome email");
      err.status = 500;
      throw err;
    }

    console.log(
      `Welcome email sent to ${associate.email}. Email ID: ${data.id}`,
    );

    res.status(200).json({
      success: true,
      message: "Account activated and welcome email sent",
      uniqueCode: uniqueCode,
      affiliateLink: affiliateLink,
    });
  } catch (error) {
    next(error);
  }
};

export default sendWelcomeEmail;
