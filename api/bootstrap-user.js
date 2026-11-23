const admin = require("firebase-admin");

function getAdminApp() {
  if (admin.apps.length) return admin.app();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable");

  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  return admin.app();
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Firebase sign-in token" });
  }

  try {
    const app = getAdminApp();
    const decoded = await admin.auth(app).verifyIdToken(authorization.slice(7));
    const user = await admin.auth(app).getUser(decoded.uid);

    if (!user.emailVerified) {
      return res.status(403).json({ error: "Please verify your email before accessing the website" });
    }

    const existingClaims = user.customClaims || {};
    if (existingClaims.role !== "authenticated") {
      await admin.auth(app).setCustomUserClaims(user.uid, {
        ...existingClaims,
        role: "authenticated"
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Firebase bootstrap error:", error.message);
    return res.status(401).json({ error: "Could not verify your account. Please sign in again." });
  }
};
