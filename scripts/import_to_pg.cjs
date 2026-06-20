const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Please set DATABASE_URL environment variable');
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

async function main() {
  const dbPath = path.join(process.cwd(), 'cloova_db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('cloova_db.json not found');
    process.exit(1);
  }
  const raw = fs.readFileSync(dbPath, 'utf8');
  const data = JSON.parse(raw);

  try {
    // Users
    const users = data.users || {};
    for (const [email, u] of Object.entries(users)) {
      const user = u;
      await pool.query(
        `INSERT INTO users(id, name, email, student_id, role, phone, nationality, programme_of_study, resident, notification_email, notification_sms, notification_in_app, password_hash, is_suspended, created_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email`,
        [
          user.id,
          user.name,
          user.email,
          user.studentId || null,
          user.role || 'student',
          user.phone || null,
          user.nationality || null,
          user.programmeOfStudy || null,
          user.resident || null,
          user.notificationEmail || false,
          user.notificationSms || false,
          user.notificationInApp !== undefined ? user.notificationInApp : true,
          user.passwordHash || null,
          user.isSuspended || false,
          user.createdAt ? new Date(user.createdAt) : new Date()
        ]
      );
    }

    // Providers
    const providers = data.providers || [];
    for (const p of providers) {
      await pool.query(
        `INSERT INTO providers(id,name,phone,specialty,notes,rating,created_at)
         VALUES($1,$2,$3,$4,$5,$6,NOW())
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [p.id, p.name, p.phone, p.specialty || null, p.notes || null, p.rating || null]
      );
    }

    // Requests
    const requests = data.requests || [];
    for (const r of requests) {
      await pool.query(
        `INSERT INTO requests(id, student_id, student_name, student_email, student_phone, category, description, photos, priority, additional_notes, status, provider_cost, service_charge, total_cost, is_quote_accepted, deposit_paid, final_paid, ready_notes, operator_notes, internal_notes, provider_id, provider_translation, cancel_reason, created_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, operator_notes = EXCLUDED.operator_notes`,
        [
          r.id,
          r.studentId || null,
          r.studentName || null,
          r.studentEmail || null,
          r.studentPhone || null,
          r.category || null,
          r.description || null,
          r.photos || [],
          r.priority || 'normal',
          r.additionalNotes || null,
          r.status || 'submitted',
          r.providerCost || null,
          r.serviceCharge || null,
          r.totalCost || null,
          r.isQuoteAccepted || false,
          r.depositPaid || false,
          r.finalPaid || false,
          r.readyNotes || null,
          r.operatorNotes || null,
          r.internalNotes || null,
          r.providerId || null,
          r.providerTranslation || null,
          r.cancelReason || null,
          r.createdAt ? new Date(r.createdAt) : new Date()
        ]
      );
    }

    // Notifications
    const notifs = data.notifications || [];
    for (const n of notifs) {
      await pool.query(
        `INSERT INTO notifications(id, student_id, title, body, is_read, created_at, request_id, amount)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET is_read = EXCLUDED.is_read`,
        [n.id, n.studentId || null, n.title || null, n.body || null, n.isRead || false, n.createdAt ? new Date(n.createdAt) : new Date(), n.requestId || null, n.amount || null]
      );
    }

    // Activities
    const acts = data.activities || [];
    for (const a of acts) {
      await pool.query(
        `INSERT INTO activities(id, user_id, user_name, user_email, action, details, created_at, request_id)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details`,
        [a.id, a.userId || null, a.userName || null, a.userEmail || null, a.action || null, a.details || null, a.createdAt ? new Date(a.createdAt) : new Date(), a.requestId || null]
      );
    }

    console.log('Import complete');
  } catch (err) {
    console.error('Import error', err);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
