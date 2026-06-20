var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_pg = __toESM(require("pg"), 1);
var import_web_push = __toESM(require("web-push"), 1);
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_crypto = __toESM(require("crypto"), 1);

// src/services/emailService.ts
var import_mail = __toESM(require("@sendgrid/mail"), 1);
var DEFAULT_FROM_EMAIL = "cloovalcontact@gmail.com";
var DEFAULT_FROM_NAME = "Cloova";
var DEFAULT_FRONTEND_URL = "http://localhost:3000";
var sendGridConfigured = false;
function ensureSendGridConfigured() {
  if (sendGridConfigured) {
    return true;
  }
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("SENDGRID_API_KEY is not configured. Email sends will fail.");
    return false;
  }
  import_mail.default.setApiKey(apiKey);
  sendGridConfigured = true;
  return true;
}
function getFromEmail() {
  return process.env.FROM_EMAIL || DEFAULT_FROM_EMAIL;
}
function getFromName() {
  return process.env.FROM_NAME || DEFAULT_FROM_NAME;
}
function getFrontendUrl() {
  return process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
}
function getEmailTokenExpireMinutes() {
  return Number(process.env.EMAIL_TOKEN_EXPIRE_MINUTES || 30);
}
async function _send(toEmail, subject, htmlContent) {
  if (!ensureSendGridConfigured()) {
    console.warn(`Skipping email send to ${toEmail} because SENDGRID_API_KEY is not configured.`);
    return false;
  }
  const message = {
    from: { email: getFromEmail(), name: getFromName() },
    to: toEmail,
    subject,
    html: htmlContent
  };
  try {
    console.log(`[SendGrid] Attempting to send email to ${toEmail} with subject: "${subject}"`);
    const result = await import_mail.default.send(message);
    const response = Array.isArray(result) ? result[0] : result;
    const statusCode = typeof response === "object" && "statusCode" in response ? response.statusCode : 0;
    const success = [200, 201, 202].includes(statusCode);
    console.log(`[SendGrid] Email send ${success ? "SUCCESS" : "FAILED"} (status: ${statusCode}) to ${toEmail}`);
    return success;
  } catch (error) {
    console.error(`[SendGrid] Email send FAILED: ${error?.message || error}`);
    return false;
  }
}
function buildEmailHtml(title, bodyCopy, buttonText, actionUrl) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;font-family:Inter,system-ui,sans-serif;background:#F5F7FA;color:#111111;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 28px 80px rgba(17,17,17,0.08);">
            <tr>
              <td style="padding:32px 32px 0;text-align:center;">
                <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.03em;">${getFromName()}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 24px;text-align:left;">
                <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#52535B;">${bodyCopy}</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${actionUrl}" style="display:inline-block;padding:14px 26px;background:#111111;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;">${buttonText}</a>
                </div>
                <p style="margin:0 0 6px;font-size:13px;color:#8F8F9C;">If the button does not work, copy and paste the link below into your browser:</p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#111111;word-break:break-word;">${actionUrl}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
async function sendVerificationEmail(toEmail, toName, token) {
  console.log(`[Email] Sending verification email to ${toEmail}`);
  const verifyUrl = `${getFrontendUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const htmlContent = buildEmailHtml(
    "Verify your Cloova account",
    `Hello ${toName || "there"},<br /><br />Please verify your Cloova account by clicking the button below. This ensures you can securely access Cloova and track your requests.`,
    "Verify your email",
    verifyUrl
  );
  return _send(toEmail, "Verify your Cloova account", htmlContent);
}
async function sendPasswordResetEmail(toEmail, toName, token) {
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const htmlContent = buildEmailHtml(
    "Reset your Cloova password",
    `Hello ${toName || "there"},<br /><br />Use the button below to reset your Cloova password. This link expires in ${getEmailTokenExpireMinutes()} minutes. If you did not request this, you can ignore this email.`,
    "Reset your password",
    resetUrl
  );
  return _send(toEmail, "Reset your Cloova password", htmlContent);
}

// src/services/tokenService.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required for email token generation.");
  }
  return secret;
}
function getEmailTokenExpireMinutes2() {
  return Number(process.env.EMAIL_TOKEN_EXPIRE_MINUTES || 30);
}
function generateEmailToken(email) {
  return import_jsonwebtoken.default.sign({ email, type: "email-verify" }, getJwtSecret(), {
    expiresIn: `${getEmailTokenExpireMinutes2()}m`
  });
}
function generatePasswordResetToken(email) {
  return import_jsonwebtoken.default.sign({ email, type: "password-reset" }, getJwtSecret(), {
    expiresIn: `${getEmailTokenExpireMinutes2()}m`
  });
}
function confirmEmailToken(token, expectedType) {
  try {
    const payload = import_jsonwebtoken.default.verify(token, getJwtSecret());
    if (typeof payload.email !== "string") {
      return null;
    }
    if (payload.type !== expectedType) {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}

// src/services/passwordService.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
function hashPassword(password) {
  return import_bcryptjs.default.hash(password, 10);
}
function comparePasswords(password, hash) {
  return import_bcryptjs.default.compare(password, hash);
}
function isHash(passwordHash) {
  return /^\$2[aby]\$/.test(passwordHash);
}

// server.ts
var VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || void 0;
var VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || void 0;
var JWT_SECRET = process.env.JWT_SECRET || void 0;
if (!JWT_SECRET) {
  console.warn("JWT_SECRET not set in environment. Tokens will not be signed securely. Set JWT_SECRET in .env for production.");
}
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    import_web_push.default.setVapidDetails("mailto:cloova@example.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (err) {
    console.error("Invalid VAPID keys provided; push notifications will be disabled.", err);
  }
} else {
  console.warn("VAPID keys not configured \u2014 push notifications disabled. Run 'npm run generate-vapid' and set VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY in .env.");
}
var { Pool } = import_pg.default;
var DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables.");
}
var pool = new Pool({
  connectionString: DATABASE_URL
});
async function initializePushSubscriptionsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        auth_key TEXT NOT NULL,
        p256dh_key TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions ON push_subscriptions(user_id);
    `);
    console.log("Push subscriptions table initialized");
  } catch (error) {
    console.error("Failed to initialize push subscriptions table:", error);
  }
}
async function ensureRequestColumns() {
  try {
    await pool.query(`
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS request_hash TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS brand TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS model TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS accessory_type TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS issues TEXT[];
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS custom_issue TEXT;
      CREATE INDEX IF NOT EXISTS idx_requests_request_hash ON requests(request_hash);
    `);
    console.log("Request table columns ensured");
  } catch (error) {
    console.error("Failed to ensure request columns:", error);
  }
}
async function ensureUserVerificationColumn() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;`);
    console.log("User verification column ensured");
  } catch (error) {
    console.error("Failed to ensure user verification column:", error);
  }
}
async function sendPushNotification(userId, title, body, requestId) {
  try {
    const result = await pool.query(
      "SELECT endpoint, auth_key, p256dh_key FROM push_subscriptions WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return;
    }
    const pushPayload = JSON.stringify({
      title,
      body,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      requestId,
      url: requestId ? `/request/${requestId}` : "/"
    });
    for (const sub of result.rows) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth_key,
          p256dh: sub.p256dh_key
        }
      };
      try {
        await import_web_push.default.sendNotification(subscription, pushPayload);
      } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          await pool.query("DELETE FROM push_subscriptions WHERE endpoint = $1", [
            sub.endpoint
          ]);
          console.log(`Removed expired push subscription for user ${userId}`);
        } else {
          console.error(`Error sending push notification:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error("Failed to send push notifications:", error);
  }
}
function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    studentId: row.student_id,
    role: row.role,
    phone: row.phone || void 0,
    nationality: row.nationality || void 0,
    programmeOfStudy: row.programme_of_study || void 0,
    resident: row.resident || void 0,
    notificationEmail: row.notification_email,
    notificationSMS: row.notification_sms,
    notificationInApp: row.notification_in_app,
    isVerified: row.is_verified || false,
    isSuspended: row.is_suspended
  };
}
function mapProvider(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    specialty: row.specialty || [],
    notes: row.notes || void 0,
    rating: row.rating,
    requestCount: row.request_count !== void 0 ? Number(row.request_count) : void 0
  };
}
function mapRequest(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    studentPhone: row.student_phone || void 0,
    brand: row.brand || void 0,
    model: row.model || void 0,
    accessoryType: row.accessory_type || void 0,
    issues: row.issues || [],
    customIssue: row.custom_issue || void 0,
    category: row.category,
    description: row.description,
    photos: row.photos || [],
    priority: row.priority,
    additionalNotes: row.additional_notes || void 0,
    status: row.status,
    providerCost: row.provider_cost !== null ? Number(row.provider_cost) : void 0,
    serviceCharge: row.service_charge !== null ? Number(row.service_charge) : void 0,
    totalCost: row.total_cost !== null ? Number(row.total_cost) : void 0,
    isQuoteAccepted: row.is_quote_accepted !== null ? row.is_quote_accepted : void 0,
    depositPaid: row.deposit_paid !== null ? row.deposit_paid : void 0,
    finalPaid: row.final_paid !== null ? row.final_paid : void 0,
    readyNotes: row.ready_notes || void 0,
    operatorNotes: row.operator_notes || void 0,
    internalNotes: row.internal_notes || void 0,
    providerId: row.provider_id || void 0,
    providerTranslation: row.provider_translation || void 0,
    cancelReason: row.cancel_reason || void 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
  };
}
function mapNotification(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    title: row.title,
    body: row.body,
    isRead: row.is_read,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
    requestId: row.request_id || void 0,
    amount: row.amount !== null ? Number(row.amount) : void 0
  };
}
function mapActivityLog(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    action: row.action,
    details: row.details,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
    requestId: row.request_id || void 0
  };
}
async function logActivity(client, userId, userName, userEmail, action, details, requestId) {
  const id = "act-" + Math.random().toString(36).substring(2, 11);
  await client.query(
    `INSERT INTO activities (id, user_id, user_name, user_email, action, details, request_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [id, userId, userName, userEmail, action, details, requestId || null]
  );
  if (userId !== "admin-1") {
    const adminNotifId = "notif-adm-" + Math.random().toString(36).substring(2, 6);
    await client.query(
      `INSERT INTO notifications (id, student_id, title, body, is_read, request_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [adminNotifId, "admin-1", `${action} - ${userName}`, details, false, requestId || null]
    );
    sendPushNotification("admin-1", `${action} - ${userName}`, details, requestId).catch(
      (err) => console.error("Failed to send push notification:", err.message)
    );
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const requestedPort = Number(process.env.PORT);
  const PORT = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 3e3;
  await ensureRequestColumns();
  await ensureUserVerificationColumn();
  await initializePushSubscriptionsTable();
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  const isProd = process.env.NODE_ENV === "production";
  app.use((0, import_helmet.default)({ contentSecurityPolicy: isProd ? void 0 : false }));
  const createRequestLimiter = (0, import_express_rate_limit.default)({
    windowMs: 60 * 1e3,
    // 1 minute
    max: 6,
    // limit each IP to 6 create requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, phone, nationality, programmeOfStudy, resident } = req.body;
    if (!name || !email || !password || !phone || !resident) {
      return res.status(400).json({ error: "Required fields (Name, Email, Password, Phone, Resident) are missing" });
    }
    const lowerEmail = email.toLowerCase();
    const isValidDomain = lowerEmail.endsWith("@alustudent.com") || lowerEmail.endsWith("@alueducation.com") || lowerEmail.endsWith("alueducation.com");
    if (!isValidDomain && lowerEmail !== "admin@cloova.com") {
      return res.status(400).json({ error: "Must use a valid Student Email (@alustudent.com or alueducation.com)" });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const existingRes = await client.query("SELECT * FROM users WHERE LOWER(email) = $1", [lowerEmail]);
      if (existingRes.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Email is already registered" });
      }
      const isFirstAdmin = lowerEmail === "admin@cloova.com" || lowerEmail.startsWith("caleb.admin");
      const generatedStudentId = `ALU-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newUserId = "user-" + Math.random().toString(36).substring(2, 11);
      const passwordHash = await hashPassword(password);
      const insertQuery = `
        INSERT INTO users (
          id, name, email, student_id, role, phone, nationality, programme_of_study, resident, 
          password_hash, is_verified, is_suspended, notification_email, notification_sms, notification_in_app, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, false, true, true, true, NOW())
        RETURNING *
      `;
      const values = [
        newUserId,
        name,
        lowerEmail,
        generatedStudentId,
        isFirstAdmin ? "admin" : "student",
        phone,
        nationality || null,
        programmeOfStudy || null,
        resident,
        passwordHash
      ];
      const userRes = await client.query(insertQuery, values);
      const dbUser = userRes.rows[0];
      const newUser = mapUser(dbUser);
      await logActivity(
        client,
        newUser.id,
        newUser.name,
        newUser.email,
        "Registration",
        `User registered as a ${newUser.role} from ${newUser.resident || "unknown location"} residence.`
      );
      await client.query("COMMIT");
      const verificationToken = generateEmailToken(lowerEmail);
      void sendVerificationEmail(lowerEmail, name, verificationToken).catch(
        (error) => console.error("Verification email async send failed:", error)
      );
      const token = JWT_SECRET ? import_jsonwebtoken2.default.sign({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" }) : Buffer.from(JSON.stringify(newUser)).toString("base64");
      res.status(201).json({ user: newUser, token });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Registration error:", err);
      res.status(500).json({ error: "Internal server error during registration: " + err.message });
    } finally {
      client.release();
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    try {
      const userRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [email.toLowerCase()]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const existing = userRes.rows[0];
      let passwordMatch = false;
      if (typeof existing.password_hash === "string" && existing.password_hash.length > 0) {
        passwordMatch = isHash(existing.password_hash) ? await comparePasswords(password, existing.password_hash) : existing.password_hash === password;
      }
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (!isHash(existing.password_hash) && existing.password_hash === password) {
        const upgradedHash = await hashPassword(password);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [upgradedHash, existing.id]);
      }
      if (existing.is_suspended) {
        return res.status(403).json({ error: "Your account is suspended. Contact admin." });
      }
      const user = mapUser(existing);
      await logActivity(pool, user.id, user.name, user.email, "Login", "Signed in from dev/web portal.");
      const token = JWT_SECRET ? import_jsonwebtoken2.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" }) : Buffer.from(JSON.stringify(user)).toString("base64");
      res.json({ user, token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Internal server error during login: " + err.message });
    }
  });
  app.post("/api/auth/resend-verification", async (req, res) => {
    const email = String(req.body?.email || "").toLowerCase();
    if (email) {
      try {
        const userRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [email]);
        if (userRes.rows.length > 0) {
          const user = userRes.rows[0];
          if (!user.is_verified) {
            const token = generateEmailToken(email);
            void sendVerificationEmail(email, user.name || "", token).catch(
              (error) => console.error("Resend verification email failed:", error)
            );
          }
        }
      } catch (error) {
        console.error("Resend verification error:", error);
      }
    }
    return res.json({
      success: true,
      message: "If an account exists with that email, a verification link has been sent."
    });
  });
  app.post("/api/auth/forgot-password", async (req, res) => {
    const email = String(req.body?.email || "").toLowerCase();
    if (email) {
      try {
        const userRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [email]);
        if (userRes.rows.length > 0) {
          const user = userRes.rows[0];
          const token = generatePasswordResetToken(email);
          void sendPasswordResetEmail(email, user.name || "", token).catch(
            (error) => console.error("Password reset email failed:", error)
          );
        }
      } catch (error) {
        console.error("Forgot password error:", error);
      }
    }
    return res.json({
      success: true,
      message: "If an account exists with that email, a reset link has been sent."
    });
  });
  app.get("/api/auth/verify-email", async (req, res) => {
    const token = String(req.query?.token || "");
    if (!token) {
      return res.status(400).json({ error: "This verification link has expired or is invalid. Please request a new one." });
    }
    const email = confirmEmailToken(token, "email-verify");
    if (!email) {
      return res.status(400).json({ error: "This verification link has expired or is invalid. Please request a new one." });
    }
    try {
      const userRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [email.toLowerCase()]);
      if (userRes.rows.length === 0) {
        return res.status(400).json({ error: "This verification link has expired or is invalid. Please request a new one." });
      }
      const user = userRes.rows[0];
      if (!user.is_verified) {
        await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [user.id]);
      }
      return res.json({ success: true, message: "Email verified successfully." });
    } catch (error) {
      console.error("Verify email error:", error);
      return res.status(500).json({ error: "Unable to verify email at this time." });
    }
  });
  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, new_password, confirm_password } = req.body;
    if (!token || !new_password || !confirm_password) {
      return res.status(400).json({ error: "Token and new password are required." });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    const email = confirmEmailToken(token, "password-reset");
    if (!email) {
      return res.status(400).json({ error: "This password reset link has expired or is invalid. Please request a new one." });
    }
    try {
      const userRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [email.toLowerCase()]);
      if (userRes.rows.length === 0) {
        return res.status(400).json({ error: "This password reset link has expired or is invalid. Please request a new one." });
      }
      const hashedPassword = await hashPassword(new_password);
      await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashedPassword, userRes.rows[0].id]);
      return res.json({ success: true, message: "Password updated successfully." });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ error: "Unable to reset password at this time." });
    }
  });
  app.post("/api/auth/sync", async (req, res) => {
    const { users, requests, notifications } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (users && Array.isArray(users)) {
        for (const u of users) {
          const emailKey = u.email ? u.email.toLowerCase() : "";
          if (emailKey) {
            const userCheck = await client.query("SELECT id FROM users WHERE LOWER(email) = $1", [emailKey]);
            if (userCheck.rows.length === 0) {
              const insertUserQuery = `
                INSERT INTO users (
                  id, name, email, student_id, role, phone, nationality, programme_of_study, resident, 
                  password_hash, is_verified, is_suspended, notification_email, notification_sms, notification_in_app, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, false, true, true, true, NOW())
                ON CONFLICT (email) DO NOTHING
              `;
              await client.query(insertUserQuery, [
                u.id,
                u.name,
                emailKey,
                u.studentId,
                u.role || "student",
                u.phone,
                u.nationality,
                u.programmeOfStudy,
                u.resident,
                u.passwordPlain || u.password || "student123"
              ]);
            }
          }
        }
      }
      if (requests && Array.isArray(requests)) {
        for (const r of requests) {
          if (r && r.id) {
            const checkReq = await client.query("SELECT * FROM requests WHERE id = $1", [r.id]);
            if (checkReq.rows.length === 0) {
              const insertReqQuery = `
                INSERT INTO requests (
                  id, student_id, student_name, student_email, student_phone, category, brand, model, accessory_type, issues, custom_issue,
                  description, photos, request_hash, priority, additional_notes, status, provider_cost, service_charge, total_cost, 
                  is_quote_accepted, deposit_paid, final_paid, ready_notes, operator_notes, internal_notes, 
                  provider_id, provider_translation, cancel_reason, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
              `;
              const photosArr = Array.isArray(r.photos) ? r.photos : [];
              const cAt = r.createdAt ? new Date(r.createdAt) : /* @__PURE__ */ new Date();
              const normalizedDescription = String(r.description || "").trim().replace(/\s+/g, " ").toLowerCase();
              const hashInput = `${r.studentId}|${r.category}|${normalizedDescription}|${photosArr.length}`;
              const requestHash = import_crypto.default.createHash("sha256").update(hashInput).digest("hex");
              await client.query(insertReqQuery, [
                r.id,
                r.studentId,
                r.studentName,
                r.studentEmail,
                r.studentPhone,
                r.category,
                r.brand || null,
                r.model || null,
                r.accessoryType || null,
                Array.isArray(r.issues) ? r.issues : [],
                r.customIssue || null,
                r.description,
                photosArr,
                requestHash,
                r.priority || "normal",
                r.additionalNotes,
                r.status || "submitted",
                r.providerCost,
                r.serviceCharge,
                r.totalCost,
                r.isQuoteAccepted || false,
                r.depositPaid || false,
                r.finalPaid || false,
                r.readyNotes,
                r.operatorNotes,
                r.internalNotes,
                r.providerId,
                r.providerTranslation,
                r.cancelReason,
                cAt
              ]);
            } else {
              const currentOnServer = checkReq.rows[0];
              const localTime = new Date(r.createdAt || 0).getTime();
              const serverTime = new Date(currentOnServer.created_at || 0).getTime();
              const statusOrder = {
                submitted: 1,
                quote_sent: 2,
                confirmed: 3,
                with_provider: 4,
                ready_for_collection: 5,
                completed: 6,
                cancelled: 7
              };
              const localStatusRank = statusOrder[r.status] || 0;
              const serverStatusRank = statusOrder[currentOnServer.status] || 0;
              if (localStatusRank > serverStatusRank || localTime > serverTime) {
                const updateQuery = `
                  UPDATE requests 
                  SET status = $2, provider_cost = $3, service_charge = $4, total_cost = $5, 
                      is_quote_accepted = $6, deposit_paid = $7, final_paid = $8, ready_notes = $9, 
                      operator_notes = $10, internal_notes = $11, provider_id = $12, 
                      provider_translation = $13, cancel_reason = $14
                  WHERE id = $1
                `;
                await client.query(updateQuery, [
                  r.id,
                  r.status || currentOnServer.status,
                  r.providerCost ?? currentOnServer.provider_cost,
                  r.serviceCharge ?? currentOnServer.service_charge,
                  r.totalCost ?? currentOnServer.total_cost,
                  r.isQuoteAccepted ?? currentOnServer.is_quote_accepted ?? false,
                  r.depositPaid ?? currentOnServer.deposit_paid ?? false,
                  r.finalPaid ?? currentOnServer.final_paid ?? false,
                  r.readyNotes ?? currentOnServer.ready_notes,
                  r.operatorNotes ?? currentOnServer.operator_notes,
                  r.internalNotes ?? currentOnServer.internal_notes,
                  r.providerId ?? currentOnServer.provider_id,
                  r.providerTranslation ?? currentOnServer.provider_translation,
                  r.cancelReason ?? currentOnServer.cancel_reason
                ]);
              }
            }
          }
        }
      }
      if (notifications && Array.isArray(notifications)) {
        for (const n of notifications) {
          if (n && n.id) {
            const checkNotif = await client.query("SELECT * FROM notifications WHERE id = $1", [n.id]);
            if (checkNotif.rows.length === 0) {
              const insertNotifQuery = `
                INSERT INTO notifications (id, student_id, title, body, is_read, request_id, amount, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `;
              const cAt = n.createdAt ? new Date(n.createdAt) : /* @__PURE__ */ new Date();
              await client.query(insertNotifQuery, [
                n.id,
                n.studentId,
                n.title,
                n.body,
                n.isRead || false,
                n.requestId,
                n.amount,
                cAt
              ]);
            } else {
              const existingNotif = checkNotif.rows[0];
              if (existingNotif.is_read !== n.isRead) {
                await client.query("UPDATE notifications SET is_read = $2 WHERE id = $1", [n.id, n.isRead]);
              }
            }
          }
        }
      }
      await client.query("COMMIT");
      res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Sync error:", err);
      res.status(500).json({ error: "Internal server error during sync: " + err.message });
    } finally {
      client.release();
    }
  });
  const getAuthenticatedUser = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    try {
      const token = authHeader.split(" ")[1];
      if (JWT_SECRET) {
        try {
          const payload = import_jsonwebtoken2.default.verify(token, JWT_SECRET);
          if (!payload || typeof payload.id !== "string") throw new Error("Invalid JWT payload");
          return { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
        } catch (jwtErr) {
          try {
            const decodedStr = Buffer.from(token, "base64").toString("utf-8");
            const parsed = JSON.parse(decodedStr);
            if (!parsed || typeof parsed.id !== "string" || typeof parsed.email !== "string" || typeof parsed.name !== "string" || parsed.role !== "student" && parsed.role !== "admin") {
              return null;
            }
            return parsed;
          } catch (e) {
            return null;
          }
        }
      } else {
        const decodedStr = Buffer.from(token, "base64").toString("utf-8");
        const parsed = JSON.parse(decodedStr);
        if (!parsed || typeof parsed.id !== "string" || typeof parsed.email !== "string" || typeof parsed.name !== "string" || parsed.role !== "student" && parsed.role !== "admin") {
          return null;
        }
        return parsed;
      }
    } catch (e) {
      return null;
    }
  };
  app.patch("/api/auth/profile", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const {
      name,
      phone,
      studentId,
      resident,
      nationality,
      programmeOfStudy,
      notificationEmail,
      notificationSMS,
      notificationInApp
    } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userRes = await client.query("SELECT * FROM users WHERE id = $1", [user.id]);
      if (userRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "User details not found" });
      }
      const targetUser = userRes.rows[0];
      const updateQuery = `
        UPDATE users 
        SET name = COALESCE($2, name),
            phone = COALESCE($3, phone),
            student_id = COALESCE($4, student_id),
            resident = COALESCE($5, resident),
            nationality = COALESCE($6, nationality),
            programme_of_study = COALESCE($7, programme_of_study),
            notification_email = COALESCE($8, notification_email),
            notification_sms = COALESCE($9, notification_sms),
            notification_in_app = COALESCE($10, notification_in_app)
        WHERE id = $1
        RETURNING *
      `;
      const values = [
        user.id,
        name !== void 0 ? name : null,
        phone !== void 0 ? phone : null,
        studentId !== void 0 ? studentId : null,
        resident !== void 0 ? resident : null,
        nationality !== void 0 ? nationality : null,
        programmeOfStudy !== void 0 ? programmeOfStudy : null,
        notificationEmail !== void 0 ? notificationEmail : null,
        notificationSMS !== void 0 ? notificationSMS : null,
        notificationInApp !== void 0 ? notificationInApp : null
      ];
      const updatedRes = await client.query(updateQuery, values);
      const updatedUser = mapUser(updatedRes.rows[0]);
      await logActivity(
        client,
        user.id,
        updatedUser.name,
        updatedUser.email,
        "Update Profile",
        `Student profile and notification options updated by user.`
      );
      await client.query("COMMIT");
      res.json(updatedUser);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Profile update error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    } finally {
      client.release();
    }
  });
  app.get("/api/requests", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
      let result;
      if (user.role === "admin") {
        result = await pool.query("SELECT * FROM requests ORDER BY created_at DESC");
      } else {
        result = await pool.query("SELECT * FROM requests WHERE student_id = $1 ORDER BY created_at DESC", [user.id]);
      }
      const requests = result.rows.map(mapRequest);
      res.json(requests);
    } catch (err) {
      console.error("Get requests error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.get("/api/requests/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await pool.query("SELECT * FROM requests WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Request not found" });
      }
      res.json(mapRequest(result.rows[0]));
    } catch (err) {
      console.error("Get request error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.delete("/api/requests/:id", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    const id = req.params.id;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const check = await client.query("SELECT * FROM requests WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Request not found" });
      }
      await client.query("DELETE FROM notifications WHERE request_id = $1", [id]);
      await client.query("DELETE FROM activities WHERE request_id = $1", [id]);
      await client.query("DELETE FROM requests WHERE id = $1", [id]);
      const actId = "act-" + Math.random().toString(36).substring(2, 11);
      await client.query(
        `INSERT INTO activities (id, user_id, user_name, user_email, action, details, request_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [actId, user.id, user.name, user.email, "Permanent Delete", `Administrator permanently deleted request #${id}`, id]
      );
      await client.query("COMMIT");
      res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Delete request error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    } finally {
      client.release();
    }
  });
  app.post(
    "/api/requests",
    /* rate limiter */
    createRequestLimiter,
    async (req, res) => {
      const user = getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized access" });
      }
      const { category, description, photos, priority, additionalNotes, studentPhone, behalfStudentId, brand, model, accessoryType, issues, customIssue } = req.body;
      if (!category || !description) {
        return res.status(400).json({ error: "Category and description are required" });
      }
      const client = await pool.connect();
      let insertQuery;
      let values;
      try {
        await client.query("BEGIN");
        const countRes = await client.query("SELECT COUNT(*) FROM requests");
        const reqIdNum = Number(countRes.rows[0].count) + 1;
        const padding = reqIdNum.toString().padStart(3, "0");
        const uniqueId = `REQ-${padding}`;
        let targetStudentId = user.id;
        let targetStudentName = user.name;
        let targetStudentEmail = user.email;
        let targetStudentPhone = studentPhone || user.phone || "";
        if (user.role === "admin" && behalfStudentId) {
          const studentRes = await client.query("SELECT * FROM users WHERE id = $1", [behalfStudentId]);
          if (studentRes.rows.length > 0) {
            const student = studentRes.rows[0];
            targetStudentId = student.id;
            targetStudentName = student.name;
            targetStudentEmail = student.email;
            targetStudentPhone = studentPhone || student.phone || "";
          }
        }
        let insertQuery2;
        let values2;
        insertQuery2 = `
        INSERT INTO requests (
          id, student_id, student_name, student_email, student_phone, category, brand, model, accessory_type, issues, custom_issue,
          description, photos, request_hash, priority, additional_notes, status, provider_cost, service_charge, total_cost, 
          is_quote_accepted, deposit_paid, final_paid, ready_notes, operator_notes, internal_notes, 
          provider_id, provider_translation, cancel_reason, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'submitted', $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW())
        RETURNING *
      `;
        const photosArr = Array.isArray(photos) ? photos : [];
        const issueValues = Array.isArray(issues) ? issues : [];
        const normalizedDescription = String(description).trim().replace(/\s+/g, " ").toLowerCase();
        const hashInput = `${targetStudentId}|${category}|${brand || ""}|${model || ""}|${accessoryType || ""}|${issueValues.join(",")}|${normalizedDescription}|${photosArr.length}`;
        const requestHash = import_crypto.default.createHash("sha256").update(hashInput).digest("hex");
        values2 = [
          uniqueId,
          targetStudentId,
          targetStudentName,
          targetStudentEmail,
          targetStudentPhone,
          category,
          brand || null,
          model || null,
          accessoryType || null,
          issueValues,
          customIssue || null,
          description,
          photosArr,
          requestHash,
          priority || "normal",
          additionalNotes || null,
          null,
          null,
          null,
          false,
          false,
          false,
          null,
          null,
          null,
          null,
          null,
          null
        ];
        let newRequest = null;
        try {
          const reqRes = await client.query(insertQuery2, values2);
          newRequest = mapRequest(reqRes.rows[0]);
        } catch (err) {
          if (err && err.code === "23505") {
            await client.query("ROLLBACK");
            return res.status(409).json({ error: "Duplicate request detected" });
          }
          throw err;
        }
        if (user.id !== targetStudentId) {
          await logActivity(
            client,
            user.id,
            user.name,
            user.email,
            "Create Behalf",
            `Submitted ${category} repair request (#${uniqueId}) on behalf of student ${targetStudentName}.`,
            uniqueId
          );
          const studentNotifId = "notif-adm-behalf-" + Math.random().toString(36).substring(2, 6);
          await client.query(
            `INSERT INTO notifications (id, student_id, title, body, is_read, request_id, created_at)
           VALUES ($1, $2, $3, $4, false, $5, NOW())`,
            [
              studentNotifId,
              targetStudentId,
              "New Repair Request Logged \u{1F6E0}\uFE0F",
              `An administrator has logged a new ${category} repair request on your behalf. (Job ID: #${uniqueId})`,
              uniqueId
            ]
          );
        } else {
          await logActivity(client, user.id, user.name, user.email, "Create Request", `Submitted ${category} repair request (#${uniqueId}).`, uniqueId);
          const adminNotifId = "notif-adm-" + Math.random().toString(36).substring(2, 6);
          await client.query(
            `INSERT INTO notifications (id, student_id, title, body, is_read, request_id, created_at)
           VALUES ($1, $2, $3, $4, false, $5, NOW())`,
            [
              adminNotifId,
              "admin-1",
              "New Job Request Submitted",
              `Student ${user.name} submitted an item for ${category} repair. (#${uniqueId})`,
              uniqueId
            ]
          );
        }
        await client.query("COMMIT");
        res.status(201).json(newRequest);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("Create request error:", err);
        try {
          console.error("Insert query:", insertQuery);
          console.error("Values length:", values?.length);
          console.error("Values:", values);
        } catch (logErr) {
          console.error("Failed to log query/values:", logErr);
        }
        res.status(500).json({ error: "Internal server error: " + err.message });
      } finally {
        client.release();
      }
    }
  );
  app.patch("/api/requests/:id", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const id = req.params.id;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const reqRes = await client.query("SELECT * FROM requests WHERE id = $1", [id]);
      if (reqRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Request not found" });
      }
      const oldRequest = mapRequest(reqRes.rows[0]);
      if (user.role === "student" && oldRequest.studentId !== user.id) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Forbidden" });
      }
      const body = req.body;
      const isRestoring = user.role === "admin" && oldRequest.status === "cancelled" && body.status && body.status !== "cancelled";
      if (oldRequest.status === "cancelled" && user.role === "student") {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Cancelled requests cannot be modified by students." });
      }
      if (oldRequest.status === "cancelled" && user.role === "admin" && !isRestoring) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Cancelled requests can only be restored by changing the status away from cancelled." });
      }
      let updatedStatus = oldRequest.status;
      let updatedProviderCost = oldRequest.providerCost;
      let updatedServiceCharge = oldRequest.serviceCharge;
      let updatedTotalCost = oldRequest.totalCost;
      let updatedIsQuoteAccepted = oldRequest.isQuoteAccepted;
      let updatedDepositPaid = oldRequest.depositPaid;
      let updatedFinalPaid = oldRequest.finalPaid;
      let updatedReadyNotes = oldRequest.readyNotes;
      let updatedOperatorNotes = oldRequest.operatorNotes;
      let updatedInternalNotes = oldRequest.internalNotes;
      let updatedProviderId = oldRequest.providerId;
      let updatedProviderTranslation = oldRequest.providerTranslation;
      let updatedCancelReason = oldRequest.cancelReason;
      let activityAction = "Request Update";
      let activityDesc = `Updated request #${id}.`;
      if (user.role === "admin") {
        if (body.status) {
          if (body.status === "cancelled" && (!body.cancelReason || !String(body.cancelReason).trim())) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "A reason is required when cancelling a request." });
          }
          updatedStatus = body.status;
        }
        if (body.providerCost !== void 0) updatedProviderCost = Number(body.providerCost);
        if (body.serviceCharge !== void 0) updatedServiceCharge = Number(body.serviceCharge);
        if (body.providerCost !== void 0 || body.serviceCharge !== void 0) {
          const pCost = updatedProviderCost || 0;
          const sCost = updatedServiceCharge || 0;
          updatedTotalCost = pCost + sCost;
        }
        if (body.operatorNotes !== void 0) updatedOperatorNotes = body.operatorNotes;
        if (body.internalNotes !== void 0) updatedInternalNotes = body.internalNotes;
        if (body.providerId !== void 0) updatedProviderId = body.providerId;
        if (body.providerTranslation !== void 0) updatedProviderTranslation = body.providerTranslation;
        if (body.readyNotes !== void 0) updatedReadyNotes = body.readyNotes;
        const isRestoring2 = oldRequest.status === "cancelled" && body.status && body.status !== "cancelled";
        if (isRestoring2) {
          updatedCancelReason = void 0;
          updatedIsQuoteAccepted = void 0;
        }
        if (body.isQuoteAccepted !== void 0) updatedIsQuoteAccepted = body.isQuoteAccepted;
        if (body.cancelReason !== void 0) updatedCancelReason = body.cancelReason;
        if (body.status && body.status !== oldRequest.status) {
          let statusTitle = "Request Updated";
          let statusText = `Your request state is now: ${body.status.replace("_", " ")}`;
          let amountVal = void 0;
          if (isRestoring2) {
            statusTitle = "Repair Request Restored \u{1F6E0}\uFE0F";
            statusText = `Your repair request #${id} has been restored by the administrator and is back under active review.`;
          } else if (body.status === "quote_sent") {
            statusTitle = "Repair Quote Available";
            amountVal = updatedTotalCost;
            statusText = `The operator sent a price quote of MUR ${amountVal || 0} for request #${id}. Please view and approve.`;
          } else if (body.status === "ready_for_collection") {
            statusTitle = "Item Ready for Collection \u{1F392}";
            statusText = `Hooray! Your ${oldRequest.category} is ready to be collected.`;
          } else if (body.status === "cancelled") {
            statusTitle = "Request Cancelled by Admin \u{1F6AB}";
            statusText = `Your request was cancelled by the administrator. Reason: ${body.cancelReason || "No reason provided"}`;
          }
          const notifId = "notif-std-" + Math.random().toString(36).substring(2, 6);
          await client.query(
            `INSERT INTO notifications (id, student_id, title, body, is_read, request_id, amount, created_at)
             VALUES ($1, $2, $3, $4, false, $5, $6, NOW())`,
            [notifId, oldRequest.studentId, statusTitle, statusText, id, amountVal || null]
          );
          if (isRestoring2) {
            sendPushNotification(oldRequest.studentId, statusTitle, statusText, id).catch(
              (err) => console.error("Failed to send push notification:", err.message)
            );
          }
          if (isRestoring2) {
            activityAction = "Request Restored";
            activityDesc = `Admin restored cancelled request #${id} and set status to "${body.status}".`;
          } else {
            activityAction = "Status Changed";
            activityDesc = `Changed status of request #${id} to "${body.status.replace("_", " ")}".`;
            if (body.status === "cancelled") {
              activityAction = "Order Cancelled (Admin)";
              activityDesc = `Cancelled request #${id}. Reason: ${body.cancelReason || "No reason provided"}.`;
            }
          }
        } else if (body.providerCost !== void 0 || body.serviceCharge !== void 0) {
          if (oldRequest.status === "quote_sent") {
            const notifId = "notif-std-" + Math.random().toString(36).substring(2, 6);
            await client.query(
              `INSERT INTO notifications (id, student_id, title, body, is_read, request_id, amount, created_at)
               VALUES ($1, $2, $3, $4, false, $5, $6, NOW())`,
              [
                notifId,
                oldRequest.studentId,
                "Repair Quote Revised \u{1F4DD}",
                `The operator has revised the price quote for request #${id} to a new total of MUR ${updatedTotalCost || 0}. Please view and approve the update.`,
                id,
                updatedTotalCost || null
              ]
            );
          }
          activityAction = "Quote Updated";
          activityDesc = `Admin drafted quote for #${id}: Cost MUR ${updatedTotalCost} (Provider: ${body.providerCost}, Support: ${body.serviceCharge}).`;
        } else if (body.providerId !== void 0 && body.providerId !== oldRequest.providerId) {
          if (body.providerId) {
            const provRes = await client.query("SELECT name FROM providers WHERE id = $1", [body.providerId]);
            const provName = provRes.rows.length > 0 ? provRes.rows[0].name : body.providerId;
            activityAction = "Provider Assigned";
            activityDesc = `Assigned request #${id} to provider: ${provName}.`;
          } else {
            activityAction = "Provider Unassigned";
            activityDesc = `Removed assigned provider from request #${id}.`;
          }
        } else if (body.operatorNotes !== void 0 && body.operatorNotes !== oldRequest.operatorNotes) {
          activityAction = "Notes Updated";
          activityDesc = `Updated student-facing notes on request #${id}.`;
        }
      } else {
        if (body.status === "cancelled") {
          const nonCancellableStages = ["with_provider", "ready_for_collection", "completed", "cancelled"];
          if (nonCancellableStages.includes(oldRequest.status)) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Cannot cancel request at this stage as it has already reached the provider." });
          }
          if (!body.cancelReason || !String(body.cancelReason).trim()) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "A reason is required when cancelling a request." });
          }
          updatedStatus = "cancelled";
          updatedCancelReason = String(body.cancelReason).trim();
          const adminNotifId = "notif-adm-" + Math.random().toString(36).substring(2, 6);
          await client.query(
            `INSERT INTO notifications (id, student_id, title, body, is_read, request_id, created_at)
             VALUES ($1, 'admin-1', $2, $3, false, $4, NOW())`,
            [adminNotifId, "Request Cancelled by Student", `Student ${user.name} cancelled request #${id}. Reason: ${updatedCancelReason}.`, id]
          );
          activityAction = "Order Cancelled (Student)";
          activityDesc = `Student cancelled request #${id}. Reason: ${updatedCancelReason}.`;
        }
        if (body.isQuoteAccepted !== void 0) {
          if (body.isQuoteAccepted === false && (!body.cancelReason || !String(body.cancelReason).trim())) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "A reason is required when declining a quote." });
          }
          updatedIsQuoteAccepted = body.isQuoteAccepted;
          updatedStatus = body.isQuoteAccepted ? "confirmed" : "cancelled";
          if (!body.isQuoteAccepted) {
            updatedCancelReason = String(body.cancelReason).trim();
          }
          const adminNotifId = "notif-adm-" + Math.random().toString(36).substring(2, 6);
          const notifBody = body.isQuoteAccepted ? `Student ${user.name} has accepted the quote for request #${id}.` : `Student ${user.name} has declined the quote for request #${id}. Reason: ${updatedCancelReason}.`;
          await client.query(
            `INSERT INTO notifications (id, student_id, title, body, is_read, request_id, created_at)
             VALUES ($1, 'admin-1', $2, $3, false, $4, NOW())`,
            [
              adminNotifId,
              `Quote ${body.isQuoteAccepted ? "Accepted" : "Declined"}`,
              notifBody,
              id
            ]
          );
          activityAction = body.isQuoteAccepted ? "Quote Approved" : "Quote Declined";
          activityDesc = body.isQuoteAccepted ? `Student accepted quote for request #${id}.` : `Student declined quote for request #${id}. Reason: ${updatedCancelReason}.`;
        }
        if (body.depositPaid !== void 0) {
          updatedDepositPaid = body.depositPaid;
          updatedStatus = "with_provider";
          activityAction = "Deposit Paid";
          activityDesc = `Student paid deposit for request #${id}. Ready for provider repair.`;
        }
      }
      const updateQuery = `
        UPDATE requests 
        SET status = $2, provider_cost = $3, service_charge = $4, total_cost = $5, 
            is_quote_accepted = $6, deposit_paid = $7, final_paid = $8, ready_notes = $9, 
            operator_notes = $10, internal_notes = $11, provider_id = $12, 
            provider_translation = $13, cancel_reason = $14
        WHERE id = $1
        RETURNING *
      `;
      const updateValues = [
        id,
        updatedStatus,
        updatedProviderCost !== void 0 ? updatedProviderCost : null,
        updatedServiceCharge !== void 0 ? updatedServiceCharge : null,
        updatedTotalCost !== void 0 ? updatedTotalCost : null,
        updatedIsQuoteAccepted !== void 0 ? updatedIsQuoteAccepted : null,
        updatedDepositPaid !== void 0 ? updatedDepositPaid : null,
        updatedFinalPaid !== void 0 ? updatedFinalPaid : null,
        updatedReadyNotes !== void 0 ? updatedReadyNotes : null,
        updatedOperatorNotes !== void 0 ? updatedOperatorNotes : null,
        updatedInternalNotes !== void 0 ? updatedInternalNotes : null,
        updatedProviderId !== void 0 ? updatedProviderId : null,
        updatedProviderTranslation !== void 0 ? updatedProviderTranslation : null,
        updatedCancelReason !== void 0 ? updatedCancelReason : null
      ];
      const patchRes = await client.query(updateQuery, updateValues);
      const patchedRequest = mapRequest(patchRes.rows[0]);
      await logActivity(client, user.id, user.name, user.email, activityAction, activityDesc, id);
      await client.query("COMMIT");
      res.json(patchedRequest);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Patch request error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    } finally {
      client.release();
    }
  });
  app.get("/api/admin/users", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Admin access only" });
    }
    try {
      const usersRes = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
      const requestsRes = await pool.query("SELECT * FROM requests");
      const activitiesRes = await pool.query("SELECT * FROM activities");
      const dbRequests = requestsRes.rows.map(mapRequest);
      const dbActivities = activitiesRes.rows.map(mapActivityLog);
      const allUsersList = usersRes.rows.map((u) => {
        const userRequests = dbRequests.filter((r) => r.studentId === u.id);
        const userActivities = dbActivities.filter((act) => act.userId === u.id);
        const mappedU = mapUser(u);
        return {
          ...mappedU,
          requests: userRequests,
          activities: userActivities,
          totalServiceRequested: userRequests.length
        };
      });
      res.json(allUsersList);
    } catch (err) {
      console.error("Admin get users error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.get("/api/admin/activities", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Admin access only" });
    }
    try {
      const result = await pool.query("SELECT * FROM activities ORDER BY created_at DESC");
      res.json(result.rows.map(mapActivityLog));
    } catch (err) {
      console.error("Admin get activities error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.patch("/api/admin/users/:id", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Admin access only" });
    }
    const { id } = req.params;
    const { name, email, phone, resident, studentId, isSuspended } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userCheck = await client.query("SELECT * FROM users WHERE id = $1", [id]);
      if (userCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "User not found" });
      }
      const targetUser = userCheck.rows[0];
      if (email && email.toLowerCase() !== targetUser.email.toLowerCase()) {
        const emailCheck = await client.query("SELECT id FROM users WHERE LOWER(email) = $1", [email.toLowerCase()]);
        if (emailCheck.rows.length > 0) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: "New email is already in use by another account" });
        }
      }
      const updateQuery = `
        UPDATE users 
        SET name = COALESCE($2, name),
            email = COALESCE($3, email),
            phone = COALESCE($4, phone),
            resident = COALESCE($5, resident),
            student_id = COALESCE($6, student_id),
            is_suspended = COALESCE($7, is_suspended)
        WHERE id = $1
        RETURNING *
      `;
      const values = [
        id,
        name !== void 0 ? name : null,
        email !== void 0 ? email.toLowerCase() : null,
        phone !== void 0 ? phone : null,
        resident !== void 0 ? resident : null,
        studentId !== void 0 ? studentId : null,
        isSuspended !== void 0 ? isSuspended : null
      ];
      const updateRes = await client.query(updateQuery, values);
      const updatedUser = mapUser(updateRes.rows[0]);
      await logActivity(
        client,
        user.id,
        user.name,
        user.email,
        "User Updated",
        `Admin updated profile details for student ${updatedUser.name} (${updatedUser.email}).`
      );
      await client.query("COMMIT");
      res.json(updatedUser);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Admin user update error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    } finally {
      client.release();
    }
  });
  app.post("/api/admin/users/:id/alert", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Admin access only" });
    }
    const { id } = req.params;
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userRes = await client.query("SELECT * FROM users WHERE id = $1", [id]);
      if (userRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "User not found" });
      }
      const userObj = userRes.rows[0];
      const alertNotifId = "notif-custom-" + Math.random().toString(36).substring(2, 6);
      await client.query(
        `INSERT INTO notifications (id, student_id, title, body, is_read, created_at)
         VALUES ($1, $2, $3, $4, false, NOW())`,
        [alertNotifId, userObj.id, title, message]
      );
      await logActivity(
        client,
        user.id,
        user.name,
        user.email,
        "Send Alert",
        `Sent custom administrative alert to ${userObj.name}: "${title}"`
      );
      await client.query("COMMIT");
      const notifRes = await pool.query("SELECT * FROM notifications WHERE id = $1", [alertNotifId]);
      res.json({ success: true, notification: mapNotification(notifRes.rows[0]) });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Admin alert error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    } finally {
      client.release();
    }
  });
  app.get("/api/providers", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Admin access only" });
    }
    try {
      const result = await pool.query(
        `SELECT p.*, COUNT(r.id) AS request_count
         FROM providers p
         LEFT JOIN requests r ON r.provider_id = p.id
         GROUP BY p.id
         ORDER BY p.created_at DESC`
      );
      res.json(result.rows.map(mapProvider));
    } catch (err) {
      console.error("Get providers error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.post("/api/providers", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Admin access only" });
    }
    const { name, phone, specialty, notes, rating } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }
    try {
      const countRes = await pool.query("SELECT COUNT(*) FROM providers");
      const nextId = Number(countRes.rows[0].count) + 1;
      const provId = "prov-" + nextId;
      const insertQuery = `
        INSERT INTO providers (id, name, phone, specialty, notes, rating, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;
      const specialtyArr = Array.isArray(specialty) ? specialty : [];
      const values = [
        provId,
        name,
        phone,
        specialtyArr,
        notes || null,
        rating !== void 0 ? Number(rating) : 5
      ];
      const result = await pool.query(insertQuery, values);
      res.status(201).json(mapProvider(result.rows[0]));
    } catch (err) {
      console.error("Create provider error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.delete("/api/providers/:id", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Admin access only" });
    }
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Provider id is required" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const refRes = await client.query("SELECT COUNT(*) FROM requests WHERE provider_id = $1", [id]);
      const refCount = Number(refRes.rows[0].count || 0);
      if (refCount > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Provider ${id} cannot be deleted because it is referenced by ${refCount} request(s)` });
      }
      await client.query("DELETE FROM providers WHERE id = $1", [id]);
      await client.query("COMMIT");
      res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Delete provider error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    } finally {
      client.release();
    }
  });
  app.get("/api/notifications", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      let targetId = user.id;
      if (user.role === "admin") {
        targetId = "admin-1";
      }
      const result = await pool.query("SELECT * FROM notifications WHERE student_id = $1 ORDER BY created_at DESC", [targetId]);
      res.json(result.rows.map(mapNotification));
    } catch (err) {
      console.error("Get notifications error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.post("/api/notifications/read-all", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const targetId = user.role === "admin" ? "admin-1" : user.id;
      await pool.query("UPDATE notifications SET is_read = true WHERE student_id = $1", [targetId]);
      res.json({ success: true });
    } catch (err) {
      console.error("Read all notifications error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.post("/api/notifications/:id/read", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    try {
      await pool.query("UPDATE notifications SET is_read = true WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error("Read single notification error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
  app.get("/api/push/vapid-key", (req, res) => {
    if (!VAPID_PUBLIC_KEY) {
      return res.status(400).json({ error: "Push notifications not configured" });
    }
    res.json({ vapidPublicKey: VAPID_PUBLIC_KEY });
  });
  app.post("/api/push/subscribe", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid subscription object" });
    }
    try {
      const { endpoint, keys } = subscription;
      const existingResult = await pool.query(
        "SELECT id FROM push_subscriptions WHERE endpoint = $1",
        [endpoint]
      );
      if (existingResult.rows.length > 0) {
        await pool.query(
          "UPDATE push_subscriptions SET user_id = $1, auth_key = $2, p256dh_key = $3 WHERE endpoint = $4",
          [user.id, keys.auth, keys.p256dh, endpoint]
        );
      } else {
        await pool.query(
          "INSERT INTO push_subscriptions (user_id, endpoint, auth_key, p256dh_key) VALUES ($1, $2, $3, $4)",
          [user.id, endpoint, keys.auth, keys.p256dh]
        );
      }
      res.json({ success: true, message: "Push subscription registered" });
    } catch (err) {
      console.error("Push subscription error:", err);
      res.status(500).json({ error: "Failed to register push subscription: " + err.message });
    }
  });
  app.post("/api/push/unsubscribe", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint is required" });
    }
    try {
      await pool.query("DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2", [
        endpoint,
        user.id
      ]);
      res.json({ success: true, message: "Push subscription removed" });
    } catch (err) {
      console.error("Push unsubscribe error:", err);
      res.status(500).json({ error: "Failed to remove push subscription: " + err.message });
    }
  });
  const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean);
  app.use(
    (0, import_cors.default)({ origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return allowedOrigins.indexOf(origin) !== -1 ? cb(null, true) : cb(new Error("Not allowed by CORS"));
    }, credentials: true })
  );
  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cloova Express Server booted on port ${PORT}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Set PORT to another value and retry.`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
