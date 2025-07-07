module.exports = function(app) {
  const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI("AIzaSyBOOIlVLwVKJeTsyHUt_yKnGKAVtz5ZAzU"); // Ganti APIKEY kamu di sini!
  const formidable = require('formidable');
  const fs = require('fs');

  async function HikmalAI({text, imageBuffer}) {
    const q = (text || "").toLowerCase().replace(/\?/g, "").trim();

    // Jawaban custom
    if (/((nama (kamu|mu|ai))|(who (are|r) (you|u))|(what('?s)? your name)|(siapa nama))/i.test(q)) {
      return `✨ Halo, aku *Hikmal AI* — sahabat virtualmu yang siap membantu, menginspirasi, dan menemani perjalanan digitalmu dengan gaya dan senyum terbaik!`;
    }
    if (/(pembuat|owner|creator|yang buat|made by|develop|author).*(kamu|mu|hikmal ai|bot|ai)/i.test(q)) {
      return `👑 Aku diciptakan oleh *Riki Shop*, inovator sejati yang menghadirkan berbagai keajaiban teknologi. Bersama Riki, hidup digitalmu penuh solusi dan kreativitas!`;
    }
    if (/(riki( shop)?|rikishop).*(siapa|what|apaan|apa|is|itu)/i.test(q) || /(siapa|what|apaan|apa|is|itu).*(riki( shop)?|rikishop)/i.test(q)) {
      return `🌟 *Riki Shop* adalah toko digital modern:  
- VPS & Hosting  
- Panel, Script Bot, Tools Premium  
- Jasa digital, plugin, dan banyak lagi  
- Support: wa.me/6285771555374  
- Sosmed: https://rikihsopreal.vercel.app  
- Produk: https://toko.rikishop.my.id  
Percayakan kebutuhan digitalmu hanya pada Riki Shop. Inovasi & pelayanan tanpa batas!`;
    }

    // Jawaban normal AI (TANPA menyebut Google)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let result;
    if (imageBuffer) {
      // Multimodal: text + image
      result = await model.generateContent([
        { parts: [{ text }], },
        { parts: [{ inlineData: { data: imageBuffer.toString('base64'), mimeType: "image/jpeg" } }] }
      ]);
    } else {
      result = await model.generateContent(text);
    }

    let jawaban = (await result.response).text();
    // Hilangkan segala mention tentang Google/gemini (replace ke Hikmal AI)
    jawaban = jawaban.replace(/model bahasa google|google generative ai|gemini ai|google ai|google|gemini/gi, "Hikmal AI");
    return jawaban;
  }

  app.post('/ai/gemini', async (req, res) => {
    try {
      const form = formidable({ multiples: false });
      form.parse(req, async (err, fields, files) => {
        try {
          if (err) return res.json({ status: false, error: 'Form-data error!' });
          const apikey = fields.apikey;
          const text = fields.text;
          if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
          if (!text) return res.json({ status: false, error: 'Param text wajib diisi!' });

          let imageBuffer = null;
          if (files.image) {
            imageBuffer = fs.readFileSync(files.image.filepath);
          }

          const result = await HikmalAI({ text, imageBuffer });
          res.json({ status: true, result });
        } catch (e) {
          res.json({ status: false, error: e.message || 'Terjadi error tidak terduga.' });
        }
      });
    } catch (e) {
      res.json({ status: false, error: e.message });
    }
  });
};