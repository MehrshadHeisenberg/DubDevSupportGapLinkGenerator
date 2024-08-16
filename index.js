const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to check the API key
function checkApiKey(req, res, next) {
  const apiKey = req.headers["api-key"];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
}

// Route to generate invite link
app.post("/generate-invite", checkApiKey, async (req, res) => {
  try {
    const inviteLink = await generateInviteLink();
    res.json({ inviteLink });
  } catch (error) {
    console.error("Error generating invite link:", error);
    res.status(500).send("Error generating invite link");
  }
});

// Function to generate the Telegram invite link
async function generateInviteLink() {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createChatInviteLink`;

  const response = await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    expire_date: 0, // No expiration
    member_limit: 1, // Only one user can use the link
  });

  if (response.data && response.data.ok) {
    return response.data.result.invite_link;
  } else {
    throw new Error("Failed to create invite link");
  }
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
