const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const API_PARAMS = "?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

const cryptoList = document.getElementById('cryptocurrencies');
const selectedCryptos = document.getElementById('selected-cryptos');
const sortBy = document.getElementById('sort-by');

// Load selected cryptocurrencies from localStorage or initialize an empty array
let selected = JSON.parse(localStorage.getItem('selectedCryptos')) || [];

// Initialize the app
async function initializeApp() {
  const response = await fetch(API_URL + API_PARAMS);
  const data = await response.json();

  // Validate and synchronize `selected` with the fetched data
  const validSelected = selected.filter(id => data.some(crypto => crypto.id === id));
  if (validSelected.length !== selected.length) {
    selected = validSelected; // Remove invalid IDs
    localStorage.setItem('selectedCryptos', JSON.stringify(selected));
  }

  // Render the cryptocurrency list and update the comparison section
  renderCryptoList(data);
  updateComparison();
}

// Fetch cryptocurrency data with sorting logic
async function fetchCryptos() {
  const response = await fetch(API_URL + API_PARAMS);
  let data = await response.json();

  // Sort data based on the selected option
  const sortByValue = sortBy.value;
  if (sortByValue === 'market_cap_desc') {
    data.sort((a, b) => b.market_cap - a.market_cap);
  } else if (sortByValue === 'price_asc') {
    data.sort((a, b) => a.current_price - b.current_price);
  } else if (sortByValue === 'price_desc') {
    data.sort((a, b) => b.current_price - a.current_price);
  }

  renderCryptoList(data);
}

// Render the list of cryptocurrencies
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

// Add a cryptocurrency to the comparison section
function addToComparison(id) {
  if (selected.length >= 3) {
    alert('You can only compare up to 3 cryptocurrencies.');
    return;
  }

  if (!selected.includes(id)) {
    selected.push(id);
    localStorage.setItem('selectedCryptos', JSON.stringify(selected));
    updateComparison();
  } else {
    alert('This cryptocurrency is already in the comparison list.');
  }
}

// Update the comparison section with selected cryptocurrencies
async function updateComparison() {
  localStorage.setItem('selectedCryptos', JSON.stringify(selected));

  const response = await fetch(API_URL + API_PARAMS);
  const data = await response.json();

  // Filter selected cryptocurrencies from the fetched data
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

  // Attach event listeners to dynamically created remove buttons
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const idToRemove = event.target.dataset.id;
      removeFromComparison(idToRemove);
    });
  });
}

// Remove a cryptocurrency from the comparison section
function removeFromComparison(id) {
  selected = selected.filter(cryptoId => cryptoId !== id);
  localStorage.setItem('selectedCryptos', JSON.stringify(selected));
  updateComparison();
}

// Handle sorting logic
sortBy.addEventListener('change', () => {
  fetchCryptos();
});

// Initialize the app and set up auto-refresh
initializeApp();
setInterval(fetchCryptos, 60000); // Update data every minute
