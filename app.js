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

app.get('/api/v3/meta-whatsapp-callback', (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];

  console.log('GET verification attempt:', req.query);

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED at /api/v3/meta-whatsapp-callback');
    return res.status(200).send(challenge); // plain text
  } else {
    console.warn('Webhook verification failed:', { mode, token });
    return res.sendStatus(403);
  }
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
    console.info(`Incoming message from ${message.from}: ${message.text}`);
    if (message.type === 'text') {
      console.info(`Incoming message from ${message.from}: ${message.text}`);
    } else if (message.type === 'image') {
      console.info(`Incoming message from ${message.from}: ${message.image}`);
    } else if (message.type === 'video') {
      console.info(`Incoming message from ${message.from}: ${message.video}`);
    } else if (message.type === 'audio') {
      console.info(`Incoming message from ${message.from}: ${message.audio}`);
    }
  }
}

function processStatusUpdates(statuses) {
  for (const status of statuses) {
    const statusId = status.id;
    const statusType = status.status;

    console.info(`Status updated for ${statusId}: ${statusType}`);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});