import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NavigationProvider } from "./context/NavigationContext.jsx";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
