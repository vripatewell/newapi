module.exports = function(app) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");

  // Inisialisasi Hikmal AI (tanpa menyebut Google di output)
  const genAI = new GoogleGenerativeAI("AIzaSyBOOIlVLwVKJeTsyHUt_yKnGKAVtz5ZAzU");

  // Jawaban khusus estetik
  function checkEstheticResponses(text) {
    const lower = text.toLowerCase();

    if (lower.includes("nama kamu siapa") || lower.includes("siapa nama kamu") || lower.includes("kamu siapa")) {
      return `✨ Perkenalkan, namaku adalah **Hikmal AI**, asisten pintar yang terlahir dari alur kode dan keindahan algoritma. ✨`;
    }

    if (lower.includes("pembuat kamu siapa") || lower.includes("siapa yang buat kamu") || lower.includes("siapa pembuat kamu")) {
      return `🌸 Aku diciptakan oleh seseorang yang penuh visi dan dedikasi — namanya **Riki**, sang penggerak dari balik layar digital. 🌸`;
    }

    if (lower.includes("riki itu siapa") || lower.includes("riki shop itu siapa") || lower.includes("riki shop") || lower.includes("rikishop")) {
      return `🌟 **Riki Shop** adalah tempat yang menyediakan segala kebutuhan digital — dari hosting, panel, script bot, jasa-jasa, hingga VPS. ✨  
Tak hanya melayani, ia juga membuka peluang.  
📱 Chat langsung pembuatku ya: [wa.me/6285771555374](https://wa.me/6285771555374)  
🌐 Sosmed: [https://rikihsopreal.vercel.app](https://rikihsopreal.vercel.app)  
🛒 Produk: [https://toko.rikishop.my.id](https://toko.rikishop.my.id)  
Ayo, jangan ragu! Order sekarang juga dan nikmati dunia digital dari sentuhan sang Riki! ✨`;
    }

    return null;
  }

  // Fungsi utama
  async function HikmalAI(textPrompt, imageBase64 = null) {
    let model, result;

    if (imageBase64) {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });

      const imageParts = [
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg",
          },
        },
      ];

      result = await model.generateContent([
        { text: textPrompt },
        ...imageParts,
      ]);
    } else {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      result = await model.generateContent(textPrompt);
    }

    const response = await result.response;
    return response.text();
  }

  // Endpoint utama
  app.get('/ai/openai', async (req, res) => {
    try {
      const { text, apikey, image } = req.query;

      if (!global.apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: 'Apikey invalid' });
      }

      if (!text) {
        return res.json({ status: false, error: 'Parameter "text" diperlukan' });
      }

      // Cek jika perlu jawaban estetik
      const predefined = checkEstheticResponses(text);
      if (predefined) {
        return res.status(200).json({ status: true, result: predefined });
      }

      const result = await HikmalAI(text, image);
      res.status(200).json({ status: true, result: result });

    } catch (error) {
      res.json({ status: false, error: error.message });
    }
  });
};