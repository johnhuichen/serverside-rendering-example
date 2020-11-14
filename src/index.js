import React from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDom from "react-dom";
import App from "./App";

ReactDom.hydrate(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
