#!/bin/bash

mkdir -p yt-summary/api
cd yt-summary

cat > package.json <<EOL
{
  "name": "yt-summary-gemini",
  "version": "1.0.0",
  "type": "module"
}
EOL

cat > vercel.json <<EOL
{
  "version": 2,
  "builds": [
    { "src": "api/proxy.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/proxy", "dest": "api/proxy.js" }
  ]
}
EOL

cat > api/proxy.js <<'EOL'
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch(
    \`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=\${apiKey}\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Không có phản hồi.';
  res.status(200).json({ result });
}
EOL

git init
git remote add origin git@github.com:FindSilent/yt-summary.git
git add .
git commit -m "Initial Gemini proxy server"
git push -u origin master
#!/bin/bash

mkdir -p yt-summary/api
cd yt-summary

cat > package.json <<EOL
{
  "name": "yt-summary-gemini",
  "version": "1.0.0",
  "type": "module"
}
EOL

cat > vercel.json <<EOL
{
  "version": 2,
  "builds": [
    { "src": "api/proxy.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/proxy", "dest": "api/proxy.js" }
  ]
}
EOL

cat > api/proxy.js <<'EOL'
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch(
    \`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=\${apiKey}\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Không có phản hồi.';
  res.status(200).json({ result });
}
EOL

git init
git remote add origin git@github.com:FindSilent/yt-summary.git
git add .
git commit -m "Initial Gemini proxy server"
git push -u origin master

