import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { env } from "./config/env.config";
import connectDB from "./config/db.config";
import v1Routes from "./routes/v1/index";
import errorHandlerMiddleware from "./middlewares/errorHandler";
import notFoundMiddleware from "./middlewares/notFound";
import cookieParser from "cookie-parser";
import { Product } from "./models/product.model";

dotenv.config();

connectDB();

const app = express();

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Configure helmet with exceptions for webhook
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for now
  })
);

const corsOptions = {
  origin: env.FRONTEND_URL.includes(",") ? env.FRONTEND_URL.split(",") : env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-VERIFY", "x-verify"],
};

app.use(cors(corsOptions));

app.use(cookieParser());


// Apply express.json() with raw body capture for webhooks
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));

app.get("/sitemap.xml", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).select('sku updatedAt');
    
    const staticRoutes = [
      '', '/products', '/customize', '/corporate', '/about', 
      '/craftsmanship', '/contact', '/reviews', '/track-order', 
      '/privacy-policy', '/refund-policy', '/shipping-policy', '/terms'
    ];

    const baseUrl = 'https://zuley.in';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes
    for (const route of staticRoutes) {
      xml += `\n  <url>\n    <loc>${baseUrl}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>`;
    }

    // Add dynamic product routes
    for (const product of products) {
      xml += `\n  <url>\n    <loc>${baseUrl}/products/${product.sku}</loc>\n    <lastmod>${product.updatedAt ? new Date(product.updatedAt as Date).toISOString() : new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;
    }

    xml += `\n</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).end();
  }
});

app.use("/api/v1", v1Routes);

if (env.NODE_ENV === "production") {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Zuley API is running smoothly",
      environment: "production"
    });
  });
}

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const args = process.argv.slice(2);
const portArgIndex = args.indexOf("--port");
const PORT =
  portArgIndex !== -1
    ? Number(args[portArgIndex + 1])
    : env.PORT;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
