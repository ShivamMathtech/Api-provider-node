const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

// Initialize the app and middleware
const app = express();
app.use(bodyParser.json());
app.use(cors());

// OpenAI API Configuration
const configuration = new Configurationn({
  apiKey: "your_openai_api_key_here", // Replace with your OpenAI API key
});
const openai = new OpenAIApi(configuration);

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to the JSON Generator API using GPT-3");
});

// JSON Generation Endpoint
app.post("/generate-json", async (req, res) => {
  const { requestType, count } = req.body;

  try {
    // GPT prompt to generate the desired JSON structure
    const prompt = `Generate a JSON file with ${count} ${requestType}. The format should be clear and include realistic example data.`;

    const gptResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedJSON = gptResponse.data.choices[0].text.trim();

    // Convert the generated response to JSON
    const jsonData = JSON.parse(generatedJSON);

    // Save JSON to a file
    const filePath = `./generated-${requestType}.json`;
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    // Return the file path and generated JSON
    res.json({
      message: `Successfully generated ${requestType} JSON`,
      json: jsonData,
      downloadLink: `http://localhost:5000/download/${requestType}`,
    });
  } catch (error) {
    console.error("Error generating JSON:", error);
    res.status(500).json({ error: "Failed to generate JSON" });
  }
});

// JSON File Download Endpoint
app.get("/download/:type", (req, res) => {
  const { type } = req.params;
  const filePath = `./generated-${type}.json`;

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
