const express = require('express');
const app = express();

// A test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
