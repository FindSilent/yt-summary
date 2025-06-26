const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  const { url, prompt } = req.body;

  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    let textContent = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      const transcript = await fetchTranscript(videoId);
      textContent = transcript || '';
    } else {
      const page = await fetch(url);
      const html = await page.text();
      const dom = new JSDOM(html, { url });
      const article = new Readability(dom.window.document).parse();
      textContent = article?.textContent || '';
    }

    if (!textContent || textContent.length < 100) {
      return res.status(500).json({ error: 'Không thể lấy nội dung từ URL hoặc nội dung quá ngắn' });
    }

    const finalPrompt = prompt?.trim()
      ? `${prompt.trim()}\n\n${textContent}`
      : `Tóm tắt nội dung sau:\n\n${textContent}`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: finalPrompt }]
          }
        ]
      })
    });

    const geminiData = await geminiRes.json();
    const summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      return res.status(500).json({ error: 'Gemini không trả về nội dung', raw: geminiData });
    }

    return res.status(200).json({ summary });

  } catch (err) {
    console.error("Lỗi server:", err);
    return res.status(500).json({ error: err.message });
  }
};

async function fetchTranscript(videoId) {
  try {
    const res = await fetch(`https://yt.lemnoslife.com/videos?part=transcript&id=${videoId}`);
    const json = await res.json();
    return json?.items?.[0]?.transcript?.segments?.map(s => s.text).join(' ') || '';
  } catch {
    return '';
  }
}

function extractYouTubeId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : '';
}
