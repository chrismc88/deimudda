import { Router, Request, Response } from "express";
import { storagePut } from "../storage";
import multer from "multer";
import { randomBytes } from "crypto";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/upload", upload.single("file"), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "File must be an image" });
    }

    // Generate unique filename
    const ext = req.file.originalname.split(".").pop();
    const filename = `${randomBytes(8).toString("hex")}-${Date.now()}.${ext}`;
    const key = `uploads/images/${filename}`;

    // Upload to S3
    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    res.json({ url });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;

