import express from "express";
import path from "path";
import fs from "fs";
import { parse } from "csv-parse/sync";

const app = express();
app.use(express.json());

// Mock Data
let products = [
  {
    id: "shampoo-a",
    name: "Shampoo A",
    stock: 45,
    predictedDemand: 150,
    salesHistory: [50, 60, 45, 70, 55, 65, 40],
    status: "Low",
    category: "Hair Care"
  },
  {
    id: "shampoo-b",
    name: "Shampoo B",
    stock: 115,
    predictedDemand: 130,
    salesHistory: [100, 110, 105, 115, 120, 110, 125],
    status: "Normal",
    category: "Hair Care"
  }
];

const orders: any[] = [];

// API Routes - Using a router to handle both /api and non-/api prefixes if needed
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", mode: "serverless", time: new Date().toISOString() });
});

router.get("/products", (req, res) => {
  res.json(products);
});

router.get("/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

router.get("/orders", (req, res) => {
  res.json(orders);
});

router.post("/orders", (req, res) => {
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

// Support both prefixes
app.use("/api", router);
app.use("/", router);

export default app;
