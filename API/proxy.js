// api/proxy.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY; // Đặt trong Vercel Environment Variables
  const { content } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: content }] }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ summary: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: 'Failed to generate summary', raw: data });
    }

  } catch (err) {
    res.status(500).json({ error: 'Request failed', detail: err.message });
  }
}
