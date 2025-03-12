import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Modal from "react-modal";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
Modal.setAppElement("#root");
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

reportWebVitals();
