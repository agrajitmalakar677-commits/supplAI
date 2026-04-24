import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { parse } from "csv-parse/sync";
import chokidar from "chokidar";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initial Mock Data (will be overwritten if CSV exists)
  let products = [
    {
      id: "shampoo-a",
      name: "Shampoo A",
      stock: 40,
      predictedDemand: 150,
      salesHistory: [50, 60, 45, 70, 55, 65, 40],
      status: "Low",
      category: "Hair Care"
    },
    {
      id: "shampoo-b",
      name: "Shampoo B",
      stock: 120,
      predictedDemand: 130,
      salesHistory: [100, 110, 105, 115, 120, 110, 125],
      status: "Normal",
      category: "Hair Care"
    }
  ];

  const csvPath = path.join(process.cwd(), "sales_data.csv");

  const loadDataFromCSV = async () => {
    try {
      if (await fs.pathExists(csvPath)) {
        const fileContent = await fs.readFile(csvPath, "utf-8");
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          cast: true
        });

        // Map CSV records back to our product structure
        products = records.map((r: any) => ({
          ...r,
          // Ensure salesHistory exists even if not in CSV for simplicity
          salesHistory: r.salesHistory 
            ? (typeof r.salesHistory === 'string' ? r.salesHistory.split(',').map(Number) : r.salesHistory)
            : [50, 60, 45, 70, 55, 65, 40]
        }));
        console.log("✅ Inventory updated from sales_data.csv");
      }
    } catch (error) {
      console.error("❌ Error reading CSV:", error);
    }
  };

  // Initial load
  await loadDataFromCSV();

  // WATCH FOR CSV CHANGES
  chokidar.watch(csvPath).on("change", () => {
    console.log("🔄 CSV Change detected, reloading inventory...");
    loadDataFromCSV();
  });

  const orders: any[] = [];

  // API Routes
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.get("/api/orders", (req, res) => {
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { productId, productName, quantity, totalCost } = req.body;
    const newOrder = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      productId,
      productName,
      quantity: quantity || 100,
      status: "Pending",
      date: new Date().toISOString(),
      totalCost: totalCost || (quantity || 100) * 450
    };
    orders.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
