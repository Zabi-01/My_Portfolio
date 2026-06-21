import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Route for sending emails via EmailJS (Server-side proxy)
app.post("/api/send-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("EmailJS credentials not configured.");
      return res.status(503).json({ error: "Email service not configured in secrets." });
    }

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        from_name: name,
        from_email: email,
        message: message,
        reply_to: email,
      },
      ...(privateKey && { accessToken: privateKey })
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      res.json({ success: true, message: "Handshake successful. Message transmitted." });
    } else {
      const errorText = await response.text();
      console.error("EmailJS API Error:", errorText);
      res.status(502).json({ error: "Email delivery service refused packet." });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal processing error during transmission." });
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// Production/Dev handling
async function setupServer() {
  console.log(`Setting up server in ${process.env.NODE_ENV} mode...`);
  
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { port: 24679 }, // Explicit port to avoid "Port already in use" errors
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath, { index: false }));
    
    // Catch-all route for SPA - Express 5 uses '*all' for global matching
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start server
  if (!process.env.VERCEL) {
    console.log(`Attempting to bind to 0.0.0.0:${PORT}...`);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server successfully started and listening on http://0.0.0.0:${PORT}`);
    });
  }
}

setupServer().catch((err) => {
  console.error("Critical Failure: Server failed to initialize:", err);
  process.exit(1);
});

export default app;
