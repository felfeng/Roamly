import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

function client() {
  createRoot(document.getElementById("root")).render(<App />);
}

if (typeof document !== "undefined") {
  client();
}
