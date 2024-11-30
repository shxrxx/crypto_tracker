const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const API_PARAMS = "?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

const cryptoList = document.getElementById('cryptocurrencies');
const selectedCryptos = document.getElementById('selected-cryptos');
const sortBy = document.getElementById('sort-by');

let selected = JSON.parse(localStorage.getItem('selectedCryptos')) || [];

// Fetch cryptocurrency data
async function fetchCryptos() {
  const response = await fetch(API_URL + API_PARAMS);
  const data = await response.json();
  renderCryptoList(data);
}

// Render cryptocurrency list
function renderCryptoList(cryptos) {
  cryptoList.innerHTML = '';
  cryptos.forEach(crypto => {
    const card = document.createElement('div');
    card.className = 'crypto-card';
    card.innerHTML = `
      <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
      <p>Price: $${crypto.current_price.toFixed(2)}</p>
      <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
      <button onclick="addToComparison('${crypto.id}')">Add to Compare</button>
    `;
    cryptoList.appendChild(card);
  });
}

// Add cryptocurrency to comparison
function addToComparison(id) {
  if (selected.length >= 5) {
    alert('You can only compare up to 5 cryptocurrencies.');
    return;
  }

  if (!selected.includes(id)) {
    selected.push(id);
    updateComparison();
  }
}

// Update comparison section
async function updateComparison() {
    localStorage.setItem('selectedCryptos', JSON.stringify(selected));
    const response = await fetch(API_URL + API_PARAMS);
    const data = await response.json();
    const selectedData = data.filter(crypto => selected.includes(crypto.id));
  
    selectedCryptos.innerHTML = '';
    selectedData.forEach(crypto => {
      const card = document.createElement('div');
      card.className = 'crypto-card';
      card.innerHTML = `
        <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
        <p>Price: $${crypto.current_price.toFixed(2)}</p>
        <p>Market Cap: $${crypto.market_cap.toLocaleString()}</p>
        <button class="remove-btn" data-id="${crypto.id}">Remove</button>
      `;
      selectedCryptos.appendChild(card);
    });
  
    // Add event listeners to all remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const idToRemove = event.target.dataset.id;
        removeFromComparison(idToRemove);
      });
    });
  }
  

// Remove cryptocurrency from comparison
function removeFromComparison(id) {
  selected = selected.filter(cryptoId => cryptoId !== id);
  updateComparison();
}

// Sort cryptocurrencies by user preference
sortBy.addEventListener('change', () => {
  fetchCryptos();
});

// Initialize app
fetchCryptos();
updateComparison();
setInterval(fetchCryptos, 60000); // Update every minute
