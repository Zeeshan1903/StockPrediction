// public/script.js
console.log("HI");

//Here i will fetfch and POST req asking for the data from the backend part 
async function fetchStockData(symbol) {
    const response = await fetch('/api/stock-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol })
    });
    return await response.json();
}

//This is the stcok for whcih I am fetching the result 
console.log(fetchStockData('AAPL'));


//These are some patterns which I am using right now

//Index means on the day for which we are chekcng 
function isShootingStar(prices, index) {
    if (index < 2) return false;
    const body = prices[index - 1];
    const upperShadow = prices[index] - prices[index - 1];
    const lowerShadow = prices[index - 2] - prices[index - 1];
    return upperShadow > 2 * body && lowerShadow < body * 0.5;
}

function isHammer(prices, index) {
    if (index < 2) return false;
    const body = prices[index - 1];
    const lowerShadow = prices[index - 2] - prices[index - 1];
    const upperShadow = prices[index] - prices[index - 1];
    return lowerShadow > 2 * body && upperShadow < body * 0.5;
}

function isBullishEngulfing(prices, index) {
    if (index < 2) return false;
    return prices[index - 1] < prices[index - 2] && prices[index] > prices[index - 1] && prices[index] > prices[index - 2];
}

function isBearishEngulfing(prices, index) {
    if (index < 2) return false;
    return prices[index - 1] > prices[index - 2] && prices[index] < prices[index - 1] && prices[index] < prices[index - 2];
}

function isDoji(prices, index) {
    if (index < 1) return false;
    const body = Math.abs(prices[index] - prices[index - 1]);
    return body < (prices[index] * 0.1); // Body is very small compared to price
}

function isMorningStar(prices, index) {
    if (index < 3) return false;
    return prices[index - 3] > prices[index - 2] && prices[index - 2] < prices[index - 1] && prices[index] > prices[index - 3];
}

function isEveningStar(prices, index) {
    if (index < 3) return false;
    return prices[index - 3] < prices[index - 2] && prices[index - 2] > prices[index - 1] && prices[index] < prices[index - 3];
}

function simulateTrading(prices) {
    const signals = [];
    const transactions = [];
    let lastBuyPrice = 0;

    for (let i = 1; i < prices.length; i++) {

        //Here i will be checking for all the patterns whether they are satisfying proper pattern or not
        if (isShootingStar(prices, i)) {
            if (lastBuyPrice > 0) {
                const sellPrice = prices[i - 1];
                const profit = sellPrice - lastBuyPrice;
                signals.push('Sell');
                transactions.push(`Sell : ${sellPrice.toFixed(2)} on day ${i} (Profit: ${profit.toFixed(2)})`);
                lastBuyPrice = 0;
            }
        } 
        else if (isHammer(prices, i)) {
            lastBuyPrice = prices[i - 1];
            signals.push('Buy');
            transactions.push(`Buy : ${lastBuyPrice.toFixed(2)} on day ${i}`);
        } 
        else if (isBullishEngulfing(prices, i)) {
            lastBuyPrice = prices[i - 1]; // Buy on bullish engulfing pattern
            signals.push('Buy');
            transactions.push(`Buy: ${lastBuyPrice.toFixed(2)} on day :${i}`);
        } 
        else if (isBearishEngulfing(prices, i)) {
            if (lastBuyPrice > 0) {
                const sellPrice = prices[i - 1];
                const profit = sellPrice - lastBuyPrice;
                signals.push('Sell');
                transactions.push(`Sell : ${sellPrice.toFixed(2)} on day ${i} (Profit: ${profit.toFixed(2)})`);
                lastBuyPrice = 0; // Reset after selling
            }
        } 
        else if (isDoji(prices, i)) {
            signals.push('Hold'); // Doji indicates indecision
        } 
        else if (isMorningStar(prices, i)) {
            lastBuyPrice = prices[i - 1]; // Buy on morning star pattern
            signals.push('Buy');
            transactions.push(`Buy : ${lastBuyPrice.toFixed(2)} on day ${i}`);
        } 
        else if (isEveningStar(prices, i)) {
            if (lastBuyPrice > 0) {
                const sellPrice = prices[i - 1];
                const profit = sellPrice - lastBuyPrice;
                signals.push('Sell');
                transactions.push(`Sell : ${sellPrice.toFixed(2)} on day ${i} (Profit: ${profit.toFixed(2)})`);
                lastBuyPrice = 0; // Reset after selling
            }
        } 
        else {
            signals.push('Hold');
        }
    }
    return { signals, transactions };
}

// Function to run on page load
async function loadData() {
    const symbol = 'AAPL'; // Example stock symbol
    const data = await fetchStockData(symbol);
    const prices = data.map(item => item.close);

    const { signals, transactions } = simulateTrading(prices);

    // Calculate net profit
    let netProfit = 0;
    transactions.forEach(transaction => {
        const match = transaction.match(/Profit: ([\d.-]+)/);
        if (match) {
            netProfit += parseFloat(match[1]);
        }
    });

    // Chart.js Visualization
    //Tjhis is a lib avaibnle in js using which u can create Chart 
    const ctx = document.getElementById('myChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: prices.length }, (_, i) => i + 1),
            datasets: [{
                label: 'Stock Price',
                data: prices,
                borderColor: 'blue',
                fill: false,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // Display Transactions and Net Profit
    const transactionList = document.createElement('ul');
    transactions.forEach(transaction => {
        const listItem = document.createElement('li');
        listItem.textContent = transaction;
        transactionList.appendChild(listItem);
    });

    document.getElementById('transactions').appendChild(transactionList);
    document.getElementById('netProfit').textContent = `Net Profit: $${netProfit.toFixed(2)}`;
}

// Call loadData when the page loads
window.onload = loadData;
