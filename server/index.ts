import express from "express";
import { validateUrl } from "./middleware/validateUrl";
import { previewRateLimiter } from "./middleware/rateLimit";
import previewRouter from "./routes/preview";

const app = express();
app.use(express.json());

app.use("/preview", validateUrl, previewRateLimiter, previewRouter);

app.get("/", (req, res) => res.send("Server is running!"));

export default app;
