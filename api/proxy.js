const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // 🛡️ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    let textContent = '';

    // 🎥 YouTube transcript
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      const transcript = await fetchTranscript(videoId);
      textContent = transcript || '';
      console.log(`✅ YouTube transcript length: ${textContent.length}`);
    }
    // 🌐 Web article
    else {
      const page = await fetch(url);
      const html = await page.text();
      const dom = new JSDOM(html, { url });
      const article = new Readability(dom.window.document).parse();

      console.log("📰 Parsed article title:", article?.title);
      console.log("📄 textContent length:", article?.textContent?.length);

      textContent = article?.textContent || '';
    }

    if (!textContent || textContent.trim().length < 30) {
      console.warn("⚠️ Nội dung quá ngắn hoặc không lấy được");
      return res.status(500).json({ error: 'Không thể lấy nội dung từ URL hoặc nội dung quá ngắn' });
    }

    // 🤖 Gửi đến Gemini
    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: `Tóm tắt nội dung sau:\n\n${textContent.slice(0, 5000)}` }]
        }
      ]
    };

    console.log("📤 Gửi đến Gemini, đoạn đầu:", geminiBody.contents[0].parts[0].text.slice(0, 200));

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody)
    });

    const geminiData = await geminiRes.json();
    const summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      console.error("❌ Gemini không trả về nội dung", JSON.stringify(geminiData, null, 2));
      return res.status(500).json({ error: 'Gemini không trả về nội dung', geminiData });
    }

    return res.status(200).json({ summary });

  } catch (err) {
    console.error("💥 Server error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 📺 Lấy transcript từ API phụ
async function fetchTranscript(videoId) {
  try {
    const res = await fetch(`https://yt.lemnoslife.com/videos?part=transcript&id=${videoId}`);
    const json = await res.json();
    return json?.items?.[0]?.transcript?.segments?.map(s => s.text).join(' ') || '';
  } catch (err) {
    console.warn("⚠️ Không lấy được transcript YouTube", err);
    return '';
  }
}

// 🆔 Trích video ID YouTube
function extractYouTubeId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : '';
}
