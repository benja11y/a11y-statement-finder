// pages/index.js
import { useState } from "react";
import axios from "axios";
import cheerio from "cheerio";

export default function Home() {
  const [url, setUrl] = useState("");
  const [accessibilityStatementUrl, setAccessibilityStatementUrl] =
    useState("");
  const [lastReviewedDate, setLastReviewedDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... other state resets

    try {
      const response = await fetch(
        `/api/getAccessibilityInfo?url=${encodeURIComponent(url)}`
      ); // Pass URL as query parameter
      if (!response.ok) {
        const errorData = await response.json(); // Get error details from the API
        throw new Error(errorData.error || "Error fetching data."); // Throw an error with details
      }

      const data = await response.json();
      setAccessibilityStatementUrl(data.accessibilityStatementUrl);
      setLastReviewedDate(data.lastReviewedDate);
    } catch (err) {
      setError(err.message); // Set the detailed error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Accessibility Statement Date Checker</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., https://www.example.com)"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Check"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {accessibilityStatementUrl && (
        <p>
          Accessibility Statement URL:{" "}
          <a
            href={accessibilityStatementUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {accessibilityStatementUrl}
          </a>
        </p>
      )}
      {lastReviewedDate && <p>Last Reviewed/Updated: {lastReviewedDate}</p>}
    </div>
  );
}
