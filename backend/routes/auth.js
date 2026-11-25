const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();

// مقارنة آمنة ضد هجمات التوقيت (timing attacks)
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || !process.env.JWT_SECRET) {
    console.error('❌ ADMIN_PASSWORD أو JWT_SECRET غير مضبوطة في .env');
    return res.status(500).json({ error: 'إعدادات الخادم غير مكتملة' });
  }

  if (!password || !safeEqual(password, adminPassword)) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  // توكن JWT موقّع بمفتاح سري وبينتهي بعد مدة محددة
  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({ token });
});

module.exports = router;
