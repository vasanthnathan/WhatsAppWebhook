// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

app.post("/api/v3/meta-whatsapp-callback", (req, res) => {
  const payload = req.body;
  handleWebhook(payload);
  return res.sendStatus(200);
});
function handleWebhook(payload) {
  const entries = payload.entry || [];

  for (const entry of entries) {
    const changes = entry.changes || [];

    for (const change of changes) {
      const value = change.value || {};

      if (value.messages) {
        processIncomingMessages(value.messages);
      }

      if (value.statuses) {
        processStatusUpdates(value.statuses);
      }
    }
  }
} 

function processIncomingMessages(messages) {
  for (const message of messages) {
    console.log(message);
  }
}

function processStatusUpdates(statuses) {
  for (const status of statuses) {
    console.log(status);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});