import { auth, db } from "../../server.js";

export const getUserRole = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    console.log(idToken);


    if (!idToken) {
      const error = new Error("ID token is required");
      console.log("Token required")
      error.status = 400;
      throw error;
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Check in users collection first (for admin)
    const userDoc = await db.collection("users").doc(userId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      return res.status(200).json({
        success: true,
        role: userData.role,
        user: {
          uid: userId,
          email: userData.email,
          fullName: userData.fullName,
          status: userData.status,
        },
      });
    }

    // Check in associates collection
    const associateDoc = await db.collection("associates").doc(userId).get();

    if (associateDoc.exists) {
      const associateData = associateDoc.data();
      return res.status(200).json({
        success: true,
        role: "associate",
        user: {
          uid: userId,
          email: associateData.email,
          fullName: associateData.fullName,
          status: associateData.status,
          uniqueCode: associateData.uniqueCode,
          affiliateLink: associateData.affiliateLink,
        },
      });
    }

    const error = new Error("User not found");
    error.status = 404;
    throw error;
  } catch (error) {
    next(error);
  }
};
