# Crypto Trading Bot

## Overview

This project is an automated crypto trading bot built with a Node.js backend and a React frontend using Vite. It currently supports the Kraken exchange and is designed to be extensible to other exchanges.

### Project Structure

- `cryptoBotBackend/`
  - `index.js`: Express backend server with API endpoints.
  - `krakenClient.js`: Kraken API client handling authenticated requests.
  - `.env`: Environment variables file (not committed) for API keys.

- `cryptoBotFrontend/`
  - `src/App.jsx`: Main React app component.
  - `src/components/Portfolio.jsx`: React component displaying your crypto portfolio with real-time balance and total USD value.
  - `src/components/TradingControls.jsx`: React component for controlling the autonomous trading bot.

## Setup and Initialization

### Backend

1. Navigate to the backend directory:
   ```bash
   cd cryptoBotBackend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `cryptoBotBackend` directory with your Kraken API credentials:
   ```
   KRAKEN_API_KEY=your_api_key_here
   KRAKEN_API_SECRET=your_api_secret_here
   ```

4. Start the backend server:
   ```bash
   node index.js
   ```

The backend server will run on `http://localhost:3001`.

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd cryptoBotFrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`.

## Trading Bot Controls Functionality

The trading bot controls allow you to autonomously trade cryptocurrencies on the Kraken exchange based on parameters you define. This functionality is exposed through the frontend React component `TradingControls.jsx` and backend API endpoints.

### Frontend Controls

- **Trading Pair:** Select the cryptocurrency trading pair (e.g., XRP/USD).
- **Buy Threshold:** The price drop ratio at which the bot will place a buy order (e.g., 0.95 means buy if price drops 5%).
- **Sell Threshold:** The price rise ratio at which the bot will place a sell order (e.g., 1.05 means sell if price rises 5%).
- **Trade Volume:** The amount of cryptocurrency to trade per order.
- **Check Interval:** How often (in milliseconds) the bot checks the market price to decide on trades.
- **Buttons:** 
  - **Update Parameters:** Sends the current parameters to the backend to update the bot's configuration.
  - **Start Bot:** Starts the autonomous trading bot.
  - **Stop Bot:** Stops the autonomous trading bot.
- **Status Display:** Shows whether the bot is currently running or stopped.

### Backend API Endpoints

- `POST /api/tradingbot/start`: Starts the trading bot.
- `POST /api/tradingbot/stop`: Stops the trading bot.
- `POST /api/tradingbot/params`: Updates the trading bot parameters with the JSON body containing the parameters.
- `GET /api/kraken/prices`: Fetches current asset prices from Kraken for portfolio valuation.

### Trading Bot Logic

- The bot periodically fetches the current market price for the selected trading pair.
- If the price drops below the last recorded price multiplied by the buy threshold, it places a market buy order for the specified volume.
- If the price rises above the last recorded price multiplied by the sell threshold, it places a market sell order for the specified volume.
- The bot emits events for trades executed, errors, and status changes, which are logged on the backend.
- The bot can be started, stopped, and reconfigured dynamically via the frontend controls.

## Portfolio Component

- Displays your current crypto asset balances fetched from the backend.
- Fetches real-time asset prices from the backend to calculate and display the total portfolio value in USD.
- Visualizes asset distribution with a pie chart.

## Important Notes

- **API Keys:** Replace the placeholder API keys in the `.env` file with your actual Kraken API key and secret. Keep these keys secure and do not share them publicly.

- **Extensibility:** The backend is designed to support multiple exchanges. You can add new exchange clients similar to `krakenClient.js`.

- **Future Work:** Real-time market tracking, enhanced trading strategies, and improved UI/UX are planned next steps.

## Contact

For questions or support, please reach out.

---
# cryptoManager
