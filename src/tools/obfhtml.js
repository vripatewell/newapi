const fetch = require('node-fetch'); // pastikan sudah node-fetch v2
const FormData = require('form-data');

module.exports = function(app) {
  // Endpoint: POST /tools/obfuscate
  app.post('/tools/obfuscate', async (req, res) => {
    try {
      const html = req.body.html || req.query.html;
      if (!html) return res.json({ status: false, error: 'Param ?html= wajib diisi!' });

      // Siapkan form-data sesuai form pada phpKobo
      const form = new FormData();
      form.append('input', html);

      // Kirim ke phpkobo
      const response = await fetch('https://www.phpkobo.com/html-obfuscator/api.php', {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
      });

      const result = await response.json();

      if (result && result.status === 'OK' && result.output) {
        res.json({ status: true, result: result.output });
      } else {
        res.json({ status: false, error: 'Gagal obfuscate HTML', detail: result });
      }
    } catch (e) {
      res.json({ status: false, error: e.message });
    }
  });
};