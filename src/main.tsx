import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function generateText() {
  try {
    const res = await fetch("http://localhost:3000/generateText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Hello Gemini",
      }),
    });

    const data = await res.json();
    console.log("Backend response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run once for testing
generateText();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
