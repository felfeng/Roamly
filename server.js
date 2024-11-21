import pkg from "pg"; // Import the entire pg package
import OpenAI from "openai"; // OpenAI API
import dotenv from "dotenv"; // Environment variable management
dotenv.config(); // Load variables from .env file

// Use pg.Client instead of pg.Pool
const { Client } = pkg;

// PostgreSQL client setup
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

await client.connect();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function server(request) {
  try {
    const url = new URL(request.url);

    if (url.pathname === "/api/itinerary" && request.method === "POST") {
      const { location, preference } = await request.json();

      const res = await client.query(
        `SELECT * FROM locations WHERE name ILIKE $1 ORDER BY RANDOM() LIMIT 10`,
        [`%${location}%`]
      );
      const places = res.rows;

      let result = places;

      // If no locations found, fetch mock data from OpenAI
      if (places.length === 0) {
        const response = await openai.createChatCompletion({
          model: "gpt-4",
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

        const mockPlaces = JSON.parse(response.data.choices[0].message.content);

        // Insert mock data into the database
        for (const place of mockPlaces) {
          await client.query(
            `INSERT INTO locations (name, type, rating, lat, lon) VALUES ($1, $2, $3, $4, $5)`,
            [place.name, place.type, place.rating, place.lat, place.lon]
          );
        }

        result = mockPlaces;
      }

      // Create an itinerary
      const itinerary = createItinerary(result, preference);

      return new Response(JSON.stringify(itinerary), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

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
