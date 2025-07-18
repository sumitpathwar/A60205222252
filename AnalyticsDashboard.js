import React, { useState } from "react";

export default function AnalyticsDashboard() {
  const [short, setShort] = useState("");
  const [visits, setVisits] = useState(null);

  const fetchVisits = async () => {
    setVisits("...");
    const res = await fetch(`/api/analytics/${short}`);
    const data = await res.json();
    setVisits(data.visits);
  };

  return (
    <div>
      <h3>Link Analytics</h3>
      <input
        placeholder="Short link ID"
        value={short}
        onChange={e => setShort(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={fetchVisits}>Get Visits</button>
      {visits !== null && <p>Total Visits: {visits}</p>}
    </div>
  );
}
