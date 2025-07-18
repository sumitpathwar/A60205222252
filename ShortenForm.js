import React, { useState } from "react";

export default function ShortenForm() {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState("");
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(null);
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        validityMinutes: validity ? parseInt(validity) : undefined,
      }),
    });
    setResponse(await res.json());
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 10 }}>
        <input
          required
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Enter a URL"
          style={{ width: "300px" }}
        />
        <input
          type="number"
          min="1"
          placeholder="Validity (min, default 30)"
          value={validity}
          onChange={e => setValidity(e.target.value)}
          style={{ width: "170px", marginLeft: 8 }}
        />
        <button style={{ marginLeft: 8 }}>Shorten</button>
      </form>
      {response && (
        <div>
          {response.short ? (
            <>
              <p>
                Short URL:
                <a
                  href={`/s/${response.short}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >{" "}{window.location.origin + `/s/${response.short}`}</a>
              </p>
              <p>Valid until: {new Date(response.expiresAt).toLocaleString()}</p>
            </>
          ) : (
            <span style={{color: "red"}}>{response.error}</span>
          )}
        </div>
      )}
    </div>
  );
}
