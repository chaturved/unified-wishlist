import request from "supertest";
import app from "../index";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const defaultTimeout = 10 * 1000;

// Mock node-fetch globally
jest.mock("node-fetch");
const { Response } = jest.requireActual("node-fetch");

describe("POST /preview", () => {
  beforeEach(() => {
    // Reset mock before each test
    (fetch as jest.MockedFunction<typeof fetch>).mockReset();
  });

  it(
    "should return metadata for a valid URL",
    async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response("<html><title>Apple</title></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        })
      );

      const response = await request(app)
        .post("/preview")
        .send({ url: "https://www.apple.com/in/shop/buy-homepod/homepod" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("image");
      expect(response.body).toHaveProperty("price");
      expect(response.body).toHaveProperty("currency");
      expect(response.body).toHaveProperty("siteName");
      expect(response.body).toHaveProperty("sourceUrl");
    },
    defaultTimeout
  );

  it("should return 400 if URL is missing", async () => {
    const response = await request(app).post("/preview").send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it(
    "should parse a local HTML fixture correctly",
    async () => {
      const htmlFixture = fs.readFileSync(
        path.join(__dirname, "fixtures", "sample.html"),
        "utf-8"
      );

      const response = await request(app)
        .post("/preview")
        .send({ url: "https://example.com", raw_html: htmlFixture });

      expect(response.status).toBe(200);
      expect(response.body.title).toBeDefined();
    },
    defaultTimeout
  );

  it(
    "should block private IPs (SSRF guard)",
    async () => {
      const response = await request(app)
        .post("/preview")
        .send({ url: "http://127.0.0.1" });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/private IP/i);
    },
    defaultTimeout
  );

  it(
    "should enforce timeout",
    async () => {
      // simulate fetch timeout
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("network timeout")), 5000)
          )
      );

      const response = await request(app)
        .post("/preview")
        .send({ url: "https://example.com" });

      expect(response.status).toBe(500);
    },
    defaultTimeout
  );

  it(
    "should enforce max HTML size",
    async () => {
      const largeHtml = "<html>" + "a".repeat(512 * 1024 + 1) + "</html>";

      const response = await request(app)
        .post("/preview")
        .send({ url: "https://example.com", raw_html: largeHtml });

      expect(response.status).toBe(413);
    },
    defaultTimeout
  );

  it(
    "should enforce rate-limit",
    async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response("<html></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        })
      );

      for (let i = 0; i < 10; i++) {
        await request(app)
          .post("/preview")
          .send({ url: "https://example.com" });
      }

      const rateLimited = await request(app)
        .post("/preview")
        .send({ url: "https://example.com" });
      expect(rateLimited.status).toBe(429); // too many requests
    },
    defaultTimeout
  );
});
