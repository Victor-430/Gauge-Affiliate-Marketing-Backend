import { v4 as uuidv4 } from "uuid";
import { auth, db } from "../../server.js";
import admin from "firebase-admin";
import { resend } from "../config/resend.js";

const sendWelcomeEmail = async (req, res, next) => {
  const generateUniqueCode = () => {
    const uuid = uuidv4();
    const firstSegment = uuid.split("-")[0];
    return `GAM${firstSegment.toUpperCase()}`;
  };

  try {
    const { idToken } = req.body;
    console.log(idToken)

    if (!idToken) {
      const error = new Error("ID token is required");
      console.log("token required")
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
    const affiliateLink = `http://localhost:5173/sales?ref=${uniqueCode}`
    // `https://affiliate.gaugesolution.com/sales?ref=${uniqueCode}`;

    // Update associate document
    await db.collection("associates").doc(userId).update({
      uniqueCode: uniqueCode,
      affiliateLink: affiliateLink,
      status: "active",
      emailVerified: true,
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["victor@gaugesolution.com"],
      // from: "Gauge Solutions <noreply@gaugesolution.com>",
      // to: [associate.email],
      subject: "Welcome to Gauge Affiliate Program",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 font-sans">
          <div class="max-w-2xl mx-auto p-5">
            <div class="bg-black text-white p-8 text-center rounded-t-xl">
              <h1 class="text-3xl font-bold m-0"> Account Activated!</h1>
              <p class="mt-2 mb-0 opacity-90">Welcome to Gauge Affiliate Program</p>
            </div>
            
            <div class="bg-gray-50 p-8 rounded-b-xl">
              <p class="mb-4">Hi <strong>${associate.fullName}</strong>,</p>
              
              <p class="mb-6">Congratulations! Your email has been verified and your account is now <strong class="text-green-600">ACTIVE</strong>.</p>
              
              <div class="bg-white border-2 border-dashed p-6 my-6 rounded-lg text-center">
                <p class="text-sm text-gray-500 mb-3 uppercase tracking-wide">Your Unique Referral Code</p>
                <div class="text-2xl font-bold text-white tracking-wider">${uniqueCode}</div>
              </div>
              
              <div class=" p-4 my-6 rounded-lg break-all">
                <p class="mb-2 m-0"><strong>📎 Your Affiliate Link:</strong></p>
                <a href="${affiliateLink}" class=" underline text-sm break-all">${affiliateLink}</a>
              </div>
      
              <hr class="border-0 border-t border-gray-200 my-8">
              
              <p class="text-sm text-gray-500 m-0">
                Need help? Contact us at <a href="mailto:support@gaugesolution.com" class="text-indigo-600">support@gaugesolution.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      const err = new Error("Failed to send welcome email");
      err.status = 500;
      throw err
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
