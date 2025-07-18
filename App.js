import React from "react";
import ShortenForm from "./ShortenForm";
import AnalyticsDashboard from "./AnalyticsDashboard";

function App() {
  return (
    <div>
      <h1>URL Shortener Sandbox</h1>
      <ShortenForm />
      <hr />
      <AnalyticsDashboard />
    </div>
  );
}

export default App;
