// Get DOM elements
const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const errorDiv = document.getElementById('error');
const resultDiv = document.getElementById('result');
const originalUrlElem = document.getElementById('originalUrl');
const shortUrlElem = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const historyDiv = document.getElementById('history');
const historyList = document.getElementById('historyList');

// Keep track of shortened URLs in local storage
let shortenedUrls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];

// Display history on page load
function displayHistory() {
  if (shortenedUrls.length === 0) {
    historyDiv.style.display = 'none';
    return;
  }

  historyDiv.style.display = 'block';
  historyList.innerHTML = '';

  shortenedUrls.forEach((item) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-item-content">
        <div class="history-item-url">${item.original_url}</div>
        <div class="history-item-short">Short: http://localhost:3000/api/shorturl/${item.short_url}</div>
      </div>
      <button class="history-item-btn" onclick="copyToClipboard('http://localhost:3000/api/shorturl/${item.short_url}')">
        Copy
      </button>
    `;
    historyList.appendChild(historyItem);
  });
}

// Copy to clipboard function
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(() => {
    alert('Failed to copy');
  });
}

// Handle form submission
urlForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();

  // Clear previous messages
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'none';

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    const response = await fetch('/api/shorturl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(url)}`
    });

    const data = await response.json();

    if (data.error) {
      showError(data.error);
    } else {
      // Display result
      originalUrlElem.textContent = data.original_url;
      shortUrlElem.textContent = `http://localhost:3000/api/shorturl/${data.short_url}`;
      resultDiv.style.display = 'block';

      // Add to history
      const existingIndex = shortenedUrls.findIndex(
        item => item.short_url === data.short_url
      );
      if (existingIndex === -1) {
        shortenedUrls.unshift(data);
        localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
        displayHistory();
      }

      // Clear input
      urlInput.value = '';
      urlInput.focus();
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Error:', error);
  }
});

// Copy button functionality
copyBtn.addEventListener('click', () => {
  const shortUrl = shortUrlElem.textContent;
  navigator.clipboard.writeText(shortUrl).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    showError('Failed to copy to clipboard');
  });
});

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  displayHistory();
  urlInput.focus();
});
