const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const url = require('url');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from client folder
app.use(express.static(path.join(__dirname, '../client')));

// In-memory storage for URL mappings
let urlDatabase = {};
let shortUrlCounter = 1;

// Helper function to validate URL
const isValidUrl = (urlString) => {
  try {
    const urlObj = new url.URL(urlString);
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper function to verify URL hostname exists
const verifyUrl = (urlString, callback) => {
  try {
    const urlObj = new url.URL(urlString);
    dns.lookup(urlObj.hostname, (err) => {
      callback(!err);
    });
  } catch {
    callback(false);
  }
};

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// POST endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL format
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Verify the URL's hostname exists
  verifyUrl(originalUrl, (isValid) => {
    if (!isValid) {
      return res.json({ error: 'invalid url' });
    }

    // Check if URL already exists in database
    for (let key in urlDatabase) {
      if (urlDatabase[key] === originalUrl) {
        return res.json({
          original_url: originalUrl,
          short_url: parseInt(key)
        });
      }
    }

    // Create new short URL
    const shortUrl = shortUrlCounter++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = parseInt(req.params.shorturl);

  if (urlDatabase[shortUrl]) {
    return res.redirect(urlDatabase[shortUrl]);
  }

  res.json({ error: 'Short URL not found' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`URL Shortener Microservice running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/ in your browser`);
});
