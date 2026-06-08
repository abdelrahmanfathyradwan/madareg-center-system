const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === '102030') {
    res.json({ token: 'madarej_admin_token_valid' });
  } else {
    res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }
});

module.exports = router;
