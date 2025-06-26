import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId" });
  }

  try {
    const response = await axios.get(
      `https://yt.lemnoslife.com/videos?part=player&id=${videoId}`
    );

    const captionsUrl = response.data.items[0]?.player?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0]?.baseUrl;

    if (!captionsUrl) {
      return res.status(404).json({ error: "No transcript available" });
    }

    const transcriptRes = await axios.get(captionsUrl + "&fmt=json3");
    const events = transcriptRes.data.events || [];

    const transcript = events
      .map(e => e.segs?.map(s => s.utf8).join("")).filter(Boolean).join(" ")
      .replace(/\s+/g, " ")
      .trim();

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json({ transcript });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Failed to fetch transcript" });
  }
}
