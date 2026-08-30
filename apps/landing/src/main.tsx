import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@abek/awesome-ui/styles.css";
import "./landing.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
