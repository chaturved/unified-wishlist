import { JSDOM } from "jsdom";
import { MetaData } from "../types/metaData";

export async function extractMeta(
  html: string,
  sourceUrl: string
): Promise<MetaData> {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // --- Titles ---
  const ogTitle = doc
    .querySelector("meta[property='og:title']")
    ?.getAttribute("content")
    ?.trim();
  const twTitle = doc
    .querySelector("meta[name='twitter:title']")
    ?.getAttribute("content")
    ?.trim();
  let oEmbedTitle: string | null = null;
  const fallbackTitle = doc.querySelector("title")?.textContent?.trim();

  // --- Images ---
  const ogImage = doc
    .querySelector("meta[property='og:image']")
    ?.getAttribute("content")
    ?.trim();
  const twImage = doc
    .querySelector("meta[name='twitter:image']")
    ?.getAttribute("content")
    ?.trim();
  let oEmbedImage: string | null = null;
  const firstImg = doc.querySelector("img")?.getAttribute("src")?.trim();

  // --- Site Name ---
  const ogSite = doc
    .querySelector("meta[property='og:site_name']")
    ?.getAttribute("content")
    ?.trim();

  // --- oEmbed ---
  const oEmbedLink = doc
    .querySelector("link[rel='alternate'][type='application/json+oembed']")
    ?.getAttribute("href");

  if (oEmbedLink) {
    try {
      const res = await fetch(oEmbedLink);
      if (res.ok) {
        const oEmbedData = await res.json();
        oEmbedTitle = oEmbedData.title || null;
        oEmbedImage = oEmbedData.thumbnail_url || null;
      }
    } catch {
      // ignore oEmbed errors
    }
  }

  // --- Price & Currency from JSON-LD or regex ---
  const { price, currency } = parsePrice(doc);

  return {
    title: ogTitle || twTitle || oEmbedTitle || fallbackTitle || null,
    image: ogImage || twImage || oEmbedImage || firstImg || null,
    price: price ?? "N/A",
    currency: currency ?? null,
    siteName: ogSite || oEmbedLink || new URL(sourceUrl).hostname,
    sourceUrl,
  };
}

function parsePrice(doc: Document): {
  price: string | null;
  currency: string | null;
} {
  // --- 1. Open Graph ---
  const ogPrice = doc
    .querySelector("meta[property='product:price:amount']")
    ?.getAttribute("content");
  const ogCurrency = doc
    .querySelector("meta[property='product:price:currency']")
    ?.getAttribute("content");

  if (ogPrice) return { price: ogPrice, currency: ogCurrency || null };

  // --- 2. JSON-LD ---
  const scripts = Array.from(
    doc.querySelectorAll('script[type="application/ld+json"]')
  );

  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent || "{}");
      const items = Array.isArray(json) ? json : [json];

      for (const item of items) {
        const offers = item.offers;
        if (!offers) continue;

        const offerArray = Array.isArray(offers) ? offers : [offers];

        for (const offer of offerArray) {
          if (offer?.price) {
            return {
              price: offer.price.toString(),
              currency: offer.priceCurrency || null,
            };
          }
        }
      }
    } catch {
      continue;
    }
  }

  // --- 3. Generic DOM fallbacks (class/id/data-* contains "price") on body ---

  const container = doc.querySelector("main") || doc.body;

  const headers = container.querySelectorAll("header, footer");
  headers.forEach((el) => el.remove());

  const priceElements = Array.from(
    container.querySelectorAll(
      '[id*="price" i], [data-testid*="price" i], [data-test*="price" i], [class*="price" i]'
    )
  );

  for (const el of priceElements) {
    const text = el.textContent?.trim();
    if (!text) continue;

    const genericRegex = /([$€£])\s?(\d[\d,.]*)/;
    const m = text.match(genericRegex);

    if (m) {
      return {
        price: m[2].replace(/,/g, ""),
        currency: m[1],
      };
    }
  }

  // --- 4. Regex fallback on body ---
  const bodyText = container.textContent || "";
  const regex = /([$€£])\s?(\d[\d,.]*)/;
  const match = bodyText.match(regex);

  if (match) {
    const symbol = match[1];
    const amount = match[2];
    return {
      price: amount.replace(/,/g, ""),
      currency: symbol,
    };
  }

  return { price: null, currency: null };
}
