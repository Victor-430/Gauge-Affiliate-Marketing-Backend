import { db } from "../../server.js";


export const createAdmin = async (req, res, next) => {
   try {
    const { email, password, fullName, phone, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_CREATION_SECRET) {
      const error = new Error('Unauthorized');
      error.status = 403;
      throw error;
    }

    const adminsSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (!adminsSnapshot.empty) {
      const error = new Error('Admin user already exists');
      error.status = 409;
      throw error;
    }

    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true,
      displayName: fullName
    });

    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      fullName: fullName,
      phone: phone,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      uid: userRecord.uid
    });

  } catch (error) {
    next(error);
  }
}


