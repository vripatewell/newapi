module.exports = function(app) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");

  // API KEY-mu
  const genAI = new GoogleGenerativeAI("AIzaSyBOOIlVLwVKJeTsyHUt_yKnGKAVtz5ZAzU");

  // Fungsi utama AI: support prompt + image (base64)
  async function HikmalAI(prom, imageBase64 = null, mode = "flash") {
    const q = (prom || "").toLowerCase().replace(/\?/g, "").trim();

    // Jawab jika ditanya nama AI
    if (
      /(nama (kamu|mu|ai)|who (are|r) (you|u)|what (is|')?s your name|siapa nama)/.test(q)
    ) {
      return `🌟 Hai, namaku *Hikmal AI*.\nAku adalah asisten digital cerdas yang siap membantu, menemani, dan memberi solusi dalam setiap aktivitasmu. Dengan semangat ramah & inovasi, aku ingin jadi teman terbaikmu di dunia digital!`;
    }

    // Jawab jika ditanya siapa pembuat AI
    if (
      /(pembuat|owner|creator|yang buat|made by|develop|author)/.test(q) &&
      /(kamu|mu|hikmal ai|bot|ai)/.test(q)
    ) {
      return `💡 Aku diciptakan & dikembangkan oleh *Riki Shop*, seorang inovator yang penuh semangat dan kreativitas dalam dunia teknologi. Bersama Riki Shop, aku hadir untuk membantu, menginspirasi, dan memudahkan segala kebutuhan digitalmu.`;
    }

    // Jawab jika ditanya "riki shop siapa" atau "riki itu siapa"
    if (
      /(riki( shop)?|rikishop).*(siapa|what|apaan|apa|is|itu)/.test(q) ||
      /(siapa|what|apaan|apa|is|itu).*(riki( shop)?|rikishop)/.test(q)
    ) {
      return `🛒 *Riki Shop* adalah toko digital modern yang menyediakan berbagai layanan:\n\n- VPS & hosting (semua kebutuhan server)\n- Panel, script bot, & tools premium\n- Jasa digital (pembuatan, setup, custom)\n- Serta banyak produk lain yang membantu aktivitasmu!\n\nKonsultasi/Order? Chat langsung pembuatku di wa.me/6285771555374\nSosmed: https://rikihsopreal.vercel.app\nProduk: https://toko.rikishop.my.id\n\nBersama Riki Shop, semua kebutuhan digitalmu pasti terbantu! ✨`;
    }

    // =================== MODE MULTIMODAL (gambar + teks) ===================
    const modelName = mode === "pro" ? "gemini-1.5-pro" : "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    let result, jawaban;

    // Jika ada gambar (base64)
    if (imageBase64) {
      // Format konten multimodal: text + image
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg", // Ganti ke image/png jika butuh
        }
      };
      result = await model.generateContent({
        contents: [{
          parts: [
            { text: prom },
            { inlineData: imagePart.inlineData }
          ]
        }]
      });
      jawaban = (await result.response).text();
    } else {
      // Hanya teks
      result = await model.generateContent(prom);
      jawaban = (await result.response).text();
    }
    // Hilangkan mention "Google"
    jawaban = jawaban.replace(/(model bahasa google|google generative ai|gemini ai|google ai|google)/gi, "Hikmal AI");
    return jawaban;
  }

  // Endpoint GET dan POST support gambar (base64)
  app.all('/ai/gemini', async (req, res) => {
    try {
      const text = req.body.text || req.query.text;
      const apikey = req.body.apikey || req.query.apikey;
      const mode = (req.body.mode || req.query.mode || "flash").toLowerCase();
      const image = req.body.image || req.query.image; // base64 (tanpa data:image/png;base64,)

      if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!text) return res.json({ status: false, error: 'Param ?text= wajib diisi' });

      const result = await HikmalAI(text, image, mode);
      res.status(200).json({
        status: true,
        result: result
      });
    } catch (error) {
      res.json({ status: false, error: error.message });
    }
  });
}
