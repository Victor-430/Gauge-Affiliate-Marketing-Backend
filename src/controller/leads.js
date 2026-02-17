import { db } from "../../server.js";
import admin from "firebase-admin";
import { resend } from "../config/resend.js";

export const leads = async (req, res, next) => {
  try {
    const {
      contactEmail,
      contactPhone,
      contactFullName,
      contactRole,
      companyName,
      industry,
      referralCode,
    } = req.body;

    if (
      !contactEmail ||
      !contactFullName ||
      !contactPhone ||
      !contactRole ||
      !companyName ||
      !referralCode ||
      !industry
    ) {
      const error = new Error("All fields are required");
      error.status = 400;
      throw error;
    }

    const associateSnapshot = await db
      .collection("associates")
      .where("uniqueCode", "==", referralCode)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (associateSnapshot.empty) {
      const error = new Error("Invalid or inactive referral code");
      error.status = 404;
      throw error;
    }

    const associateDoc = associateSnapshot.docs[0];
    const associate = associateDoc.data();
    const associateId = associateDoc.id;

    const leadRef = db.collection("leads").doc();

    await leadRef.set({
      // associate info
      associateId: associateId,
      associateCode: referralCode,
      associateName: associate.fullName,
      associateEmail: associate.email,

      // company info
      companyName: companyName,
      industry: industry,
      contactFullName: contactFullName,
      contactRole: contactRole,
      contactEmail: contactEmail,
      contactPhone: contactPhone,

      //   status
      leadStatus: "new",
      dealStatus: null,

      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db
      .collection("associates")
      .doc(associateId)
      .update({
        "stats.totalLeads": admin.firestore.FieldValue.increment(1),
      });

    await resend.emails.send({
      from: "Gauge <delivered@resend.dev>",
      to: ["victor@gaugesolution.com"],
      subject: "New Lead Submitted",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 ">
          <div class="max-w-2xl mx-auto p-5">
            <div class="bg-black text-white p-8 text-center rounded-t-xl">
              <h1 class="text-3xl font-bold mb-4"> New Lead Submitted</h1>

              <p class="mb-4">Hi <strong>${associate.fullName}</strong>,</p>
              <p class="mb-6">A new lead has been submitted using your referral code <strong>${referralCode}</strong>.</p>
              
              </div>
            
            <div class="bg-gray-50 p-8 rounded-b-xl">
                            
              <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 class="font-semibold mb-2">Lead Details:</h3>
                <p><strong>Company:</strong> ${companyName}</p>
                <p><strong>Industry:</strong> ${industry}</p>
                <p><strong>Contact:</strong> ${contactFullName} (${contactRole})</p>
                <p><strong>Email:</strong> ${contactEmail}</p>
                <p><strong>Phone:</strong> ${contactPhone}</p>
              </div>
      
               <p class="text-sm text-gray-600">Login to your dashboard to view,manage this lead and follow up.</p>
            </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Lead submitted successfully",
      leadId: leadRef.id,
    });
  } catch (error) {
    next(error);
  }
};
