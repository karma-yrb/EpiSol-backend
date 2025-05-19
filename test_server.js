const express = require('express');
const app = express();
const port = 3002;

// Test route
app.get('/test-route', (req, res) => {
  res.send('Test route is working');
});

// Log routes
console.log('Liste des routes disponibles :');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`- ${middleware.route.path}`);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});
