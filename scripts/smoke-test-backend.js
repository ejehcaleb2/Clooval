(async () => {
  const base = 'http://127.0.0.1:3000';
  const log = (...args) => console.log(...args);
  try {
    log('=== Register ===');
    let res = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test1@alustudent.com', password: 'password123', phone: '1234567890', resident: 'Maps' }),
    });
    log('register status', res.status);
    let reg = await res.json().catch(() => null);
    log('register body', reg);

    log('=== Login ===');
    res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'test1@alustudent.com', password: 'password123' }),
    });
    log('login status', res.status);
    const login = await res.json();
    log('login body', login);

    const token = login?.token;
    if (!token) {
      console.error('No token received, aborting tests');
      process.exit(1);
    }
    log('token', token.substring(0, 20) + '...');

    log('=== Create Request ===');
    res = await fetch(`${base}/api/requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ category: 'phone', description: 'Screen cracked during automated tests' }),
    });
    log('create request status', res.status);
    const createdReq = await res.json().catch(() => null);
    log('created request', createdReq);

    log('=== Sync (with bad request ref) ===');
    const syncPayload = {
      users: [{ id: 'local-user-1', name: 'Local User', email: 'local@alustudent.com', studentId: 'ALU-LOCAL-1', passwordPlain: 'pw' }],
      requests: [{ id: 'local-req-1', studentId: login.user.id, studentName: login.user.name, studentEmail: login.user.email, category: 'phone', description: 'local sync req', createdAt: new Date().toISOString() }],
      notifications: [{ id: 'local-notif-1', studentId: login.user.id, title: 'Local notif', body: 'From client sync', isRead: false, requestId: 'nonexistent-req', createdAt: new Date().toISOString() }],
    };
    res = await fetch(`${base}/api/auth/sync`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(syncPayload),
    });
    log('sync status', res.status);
    log('sync body', await res.json().catch(() => null));

    log('=== Fetch Notifications ===');
    res = await fetch(`${base}/api/notifications`, { headers: { Authorization: 'Bearer ' + token } });
    log('notifications status', res.status);
    log('notifications body', await res.json().catch(() => null));

    process.exit(0);
  } catch (err) {
    console.error('Smoke test error', err);
    process.exit(2);
  }
})();
