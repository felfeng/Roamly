import pkg from "pg";
import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const { Client } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

await client
  .connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/itinerary", async (req, res) => {
  try {
    console.log("Received request:", req.body);
    const { location, preference } = req.body;

    console.log("Querying database...");
    const dbRes = await client.query(
      `SELECT * FROM locations WHERE name ILIKE $1 ORDER BY RANDOM() LIMIT 10`,
      [`%${location}%`]
    );
    console.log("Database response:", dbRes.rows);
    const places = dbRes.rows;

    let result = places;

    // If no locations found, fetch mock data from OpenAI
    if (places.length === 0) {
      console.log("No places found, calling OpenAI...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant generating travel itineraries.",
          },
          {
            role: "user",
            content: `Generate 10 mock places for a day trip in ${location}. Include a mix of sightseeing and restaurants. Format as a JSON array with 'name', 'type' (sightseeing or food), 'rating', 'lat', and 'lon'.`,
          },
        ],
      });

      const mockPlaces = JSON.parse(response.choices[0].message.content);
      console.log("OpenAI response:", mockPlaces);

      // Insert mock data into the database
      console.log("Inserting mock data into database...");
      for (const place of mockPlaces) {
        await client.query(
          `INSERT INTO locations (name, type, rating, lat, lon) VALUES ($1, $2, $3, $4, $5)`,
          [place.name, place.type, place.rating, place.lat, place.lon]
        );
      }

      result = mockPlaces;
    }

    // Create an itinerary
    console.log("Creating itinerary..."); // Add this
    const itinerary = createItinerary(result, preference);
    console.log("Final itinerary:", itinerary); // Add this

    res.json(itinerary);
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message }); // Added error details
  }
});

// Helper function to create an itinerary
function createItinerary(places, preference) {
  const sightseeingPlaces = places
    .filter((place) => place.type === "sightseeing")
    .sort((a, b) => b.rating - a.rating);
  const foodPlaces = places
    .filter((place) => place.type === "food")
    .sort((a, b) => b.rating - a.rating);

  const totalPlaces = Math.min(6, places.length);
  const foodCount = Math.round((preference / 100) * totalPlaces);
  const sightseeingCount = totalPlaces - foodCount;

  return [
    ...sightseeingPlaces.slice(0, sightseeingCount),
    ...foodPlaces.slice(0, foodCount),
  ].map((place, index) => ({
    time: `${9 + index * 2}:00`,
    name: place.name,
    type: place.type,
    lat: place.lat,
    lon: place.lon,
  }));
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
