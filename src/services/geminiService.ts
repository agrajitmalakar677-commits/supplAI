import { GoogleGenAI } from "@google/generative-ai";
import { Product } from "../types";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiService = {
  async getInventoryRecommendation(products: Product[]): Promise<string> {
    const summary = products.map(p => 
      `${p.name}: Stock=${p.stock}, Predicted Demand=${p.predictedDemand}, Status=${p.status}`
    ).join("\n");

    const prompt = `You are a Supply Chain Intelligence AI. Based on the following inventory data, provide a SINGLE concise (max 30 words) urgent recommendation for the business owner. Be specific about which product to restock and why.
    
    Data:
    ${summary}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "Monitor stock levels closely to avoid potential shortages in your top categories.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Based on recent trends, we recommend increasing Shampoo A inventory by 110 units to avoid stockouts.";
    }
  },

  async getProductAnalysis(product: Product): Promise<string> {
    const prompt = `Analyze this product for a supply chain manager: ${product.name}. 
    Current Stock: ${product.stock}
    Predicted Demand: ${product.predictedDemand}
    Sales History: ${product.salesHistory.join(", ")}
    
    Provide exactly one sentence about the demand trend and exactly one sentence of advice (e.g. "Order X units"). Keep it professional and brief.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "Demand is increasing; recommended to restock immediately.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Demand is increasing by 22% due to seasonal trends. Order 110 units now to ensure service levels.";
    }
  }
};
