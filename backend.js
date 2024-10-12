// server.js
const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8100;
// const cors = require('cors');
// app.use(cors);
app.use(express.json());
app.use(express.static('public'));

// Serve the index.html page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});

// Function to fetch historical stock data from Yahoo Finance
async function fetchStockData(symbol) {
    try {
        const result = await yahooFinance.historical(symbol, {
            period1: '2024-08-01', // Start date
            period2: '2024-10-14', // End date
            interval: '1d' // Use daily intervals
        });
        return result;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

app.post('/api/stock-data', async (req, res) => {
    const { symbol } = req.body;
    const data = await fetchStockData(symbol);
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
