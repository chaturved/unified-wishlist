import { Request, Response, NextFunction } from "express";
import dns from "dns";
import { promisify } from "util";
import { PreviewRequest } from "../types/previewRequest";

const resolve = promisify(dns.lookup);

export async function validateUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { url }: PreviewRequest = req.body;

  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: "URL must use http or https" });
  }

  try {
    const { address } = await resolve(parsedUrl.hostname);

    if (isPrivateIP(address)) {
      return res.status(400).json({ error: "URL resolves to a private IP" });
    }
  } catch {
    return res.status(400).json({ error: "Unable to resolve URL" });
  }

  next();
}

function isPrivateIP(ip: string): boolean {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.") ||
    ip === "127.0.0.1" ||
    ip === "::1"
  );
}
