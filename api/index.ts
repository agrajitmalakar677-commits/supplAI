import express from "express";
import path from "path";
import fs from "fs-extra";
import { parse } from "csv-parse/sync";

const app = express();
app.use(express.json());

// Mock Data
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

const orders: any[] = [];

// Try to load CSV from the root of the project
const csvPath = path.join(process.cwd(), "sales_data.csv");

const loadDataFromCSV = () => {
  try {
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, "utf-8");
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true
      });

      if (records && records.length > 0) {
        products = records.map((r: any) => ({
          ...r,
          salesHistory: r.salesHistory 
            ? (typeof r.salesHistory === 'string' ? r.salesHistory.split(',').map(Number) : r.salesHistory)
            : [50, 60, 45, 70, 55, 65, 40]
        }));
      }
    }
  } catch (error) {
    console.warn("⚠️ Error loading CSV in serverless:", error);
  }
};

loadDataFromCSV();

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: "serverless", time: new Date().toISOString() });
});

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

export default app;
