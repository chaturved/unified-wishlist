import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { extractMeta } from "../utils/extractMeta";
import { PreviewRequest } from "../types/previewRequest";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { url, raw_html }: PreviewRequest = req.body;

  try {
    let html: string;

    if (raw_html?.trim()) {
      html = raw_html;
    } else {
      const response = await fetch(url, {
        headers: { "User-Agent": "UnifiedWishlistBot/1.0" },
        redirect: "follow",
        follow: 3,
        size: 512 * 1024,
        timeout: 5000,
      });

      if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch URL" });
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        return res.status(415).json({ error: "URL must return HTML" });
      }

      html = await response.text();
      if (!html.trim()) {
        return res.status(422).json({ error: "Fetched HTML is empty" });
      }
    }

    const metaData = await extractMeta(html, url);

    if (!metaData.title || !metaData.sourceUrl) {
      return res.status(500).json({ error: "Invalid Meta Data" });
    }

    return res.json(metaData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate preview" });
  }
});

export default router;
