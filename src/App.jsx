import React, { useState } from "react";
import ItineraryDisplay from "./components/ItineraryDisplay";
import "./styles/main.css";

function App() {
  const [location, setLocation] = useState("");
  const [preference, setPreference] = useState(50);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, preference }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItinerary(data);
    } catch (e) {
      setError("Failed to create itinerary. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <main>
        <h1>Day Trip Itinerary Maker</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter a location"
            required
          />
          <div className="slider-container">
            <span>Sightseeing</span>
            <input
              type="range"
              min="0"
              max="100"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
            />
            <span>Food</span>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating Itinerary..." : "Create Itinerary"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {itinerary && <ItineraryDisplay itinerary={itinerary} />}
      </main>
      <footer>
        <p>Made with 🍣 by Felicia Feng</p>
      </footer>
    </div>
  );
}

export default App;
