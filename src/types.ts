export interface Product {
  id: string;
  name: string;
  stock: number;
  predictedDemand: number;
  salesHistory: number[];
  status: "Low" | "Normal";
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  status: "Pending" | "Shipped" | "Delivered";
  date: string;
  totalCost: number;
}
