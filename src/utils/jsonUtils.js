export function cleanAndParseJSON(str) {
  str = str.replace(/```json\n?|\n?```/g, "");
  str = str.trim();
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("Failed to parse JSON:", str);
    throw new Error("Invalid JSON response from OpenAI");
  }
}
