module.exports = function(app) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const axios = require("axios");

  const genAI = new GoogleGenerativeAI("AIzaSyBOOIlVLwVKJeTsyHUt_yKnGKAVtz5ZAzU"); // Ganti dengan API kamu

  // Estetik Q&A
  function checkEstheticResponses(text) {
    const lower = (text || "").toLowerCase();
    if (lower.includes("nama kamu siapa")) {
      return `✨ Aku adalah **Hikmal AI**, asisten digital berjiwa lembut dan berpengetahuan ✨`;
    }
    if (lower.includes("pembuat kamu siapa")) {
      return `🌸 Aku lahir dari tangan kreatif sang maestro digital — **Riki**, sang arsitek dunia maya 🌸`;
    }
    if (lower.includes("riki shop") || lower.includes("riki itu siapa") || lower.includes("rikishop")) {
      return `🌟 **Riki Shop** adalah rumah digital tempat segalanya tersedia — dari VPS, panel, script bot, hingga jasa-jasa yang kamu butuhkan.  
📞 Chat langsung ke: [wa.me/6285771555374](https://wa.me/6285771555374)  
🌐 Sosmed: [https://rikihsopreal.vercel.app](https://rikihsopreal.vercel.app)  
🛍️ Produk: [https://toko.rikishop.my.id](https://toko.rikishop.my.id)  
Jangan cuma lihat, langsung order yuk ✨`;
    }
    return null;
  }

  // Deteksi jenis permintaan
  function classifyIntent(text) {
    const t = (text || "").toLowerCase();
    if (t.includes("gambar apa") || t.includes("apa ini")) return "describe-image";
    if (t.includes("tulisan") || t.includes("teks dalam gambar") || t.includes("tulisa")) return "extract-text";
    if (t.includes("error") || t.includes("kenapa error") || t.includes("benerin") || t.includes("debug")) return "code-fix";
    if (t === "." || t === "gemini" || t.includes("deteksi")) return "describe-image";
    return "general";
  }

  // Konversi URL gambar menjadi Base64
  async function convertImageURLToBase64(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  }

  // Fungsi utama Hikmal AI
  async function HikmalAI(textPrompt, imageBase64 = null) {
  const modelName = imageBase64 ? "gemini-1.5-flash" : "gemini-1.5-pro";
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(
    imageBase64
      ? [
          { text: textPrompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType: "image/jpeg"
            }
          }
        ]
      : textPrompt
  );

  const response = await result.response;
  return response.text();
}

  // Endpoint Hikmal AI
  app.get('/ai/hikmalai', async (req, res) => {
    try {
      const { text, image, apikey } = req.query;

      if (!global.apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, creator: "Rikishopreal", error: "Apikey invalid" });
      }

      if (!text && !image) {
        return res.json({ status: false, creator: "Rikishopreal", error: "Text atau gambar harus diisi" });
      }

      const special = checkEstheticResponses(text || "");
      if (special) return res.status(200).json({ status: true, creator: "Rikishopreal", result: special });

      let base64Image = image;

      // Deteksi jika image = URL, maka konversi ke Base64
      if (image && image.startsWith("http")) {
        base64Image = await convertImageURLToBase64(image);
      }

      const intent = classifyIntent(text || "");
      let prompt = text;

      // Buat prompt otomatis jika perlu
      if (base64Image) {
        if (intent === "describe-image") {
          prompt = "Tolong jelaskan gambar ini. Apa yang terlihat di dalamnya?";
        } else if (intent === "extract-text") {
          prompt = "Ambil dan tuliskan semua teks yang terlihat dalam gambar ini.";
        } else if (intent === "code-fix") {
          prompt = "Gambar ini berisi kode error. Jelaskan letak kesalahan dan berikan versi kode yang benar.";
        } else if (!text || text.trim() === "") {
          prompt = "Tolong jelaskan isi gambar ini.";
        }
      }

      const result = await HikmalAI(prompt, base64Image);
      res.status(200).json({ status: true, creator: "Rikishopreal", result });

    } catch (err) {
      res.json({ status: false, creator: "Rikishopreal", error: err.message });
    }
  });
};
