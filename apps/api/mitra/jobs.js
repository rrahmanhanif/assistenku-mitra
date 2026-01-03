module.exports = (req, res) => {
  res.status(501);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: false, code: 'NOT_IMPLEMENTED', message: 'API belum siap' });
};
