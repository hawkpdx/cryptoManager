# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an automated cryptocurrency trading bot with a Node.js/Express backend and React/Vite frontend. The system connects to the Kraken exchange API for real-time trading, portfolio management, and market data analysis.

## Architecture

### Backend Structure (`cryptoBotBackend/`)
- **`index.js`**: Express server with API endpoints and bot lifecycle management
- **`krakenClient.js`**: Kraken API client handling authentication and all exchange interactions
- **`tradingBot.js`**: Core trading logic with RSI-based and threshold-based strategies
- **`.env`**: Environment variables for Kraken API credentials (not committed to git)

### Frontend Structure (`cryptoBotFrontend/`)
- **`src/App.jsx`**: Main dashboard component with trading pair selection
- **`src/components/Portfolio.jsx`**: Real-time portfolio balance and USD valuation with pie charts
- **`src/components/TradingControls.jsx`**: Bot configuration and control interface
- **`src/components/MarketData.jsx`**: Live market data display
- **`src/components/PerformanceTracker.jsx`**: Historical performance charts

### Key Architectural Patterns
- **Event-driven trading bot**: Uses EventEmitter for trade notifications and status updates
- **RESTful API design**: Backend exposes endpoints for all frontend interactions
- **Authenticated API client**: KrakenClient handles HMAC-SHA512 signature generation for secure API calls
- **Dual trading strategies**: Combines RSI technical analysis with simple price threshold trading
- **Risk management**: Built-in minimum holding constraints and fee/tax calculations

## Development Commands

### Backend Development
```bash
# Navigate to backend
cd cryptoBotBackend

# Install dependencies
npm install

# Start backend server (runs on http://localhost:3001)
node index.js

# Run backend API tests
node ../testBackendEndpoints.js

# Test direct Kraken API integration
node ../testKrakenApi.js
```

### Frontend Development
```bash
# Navigate to frontend
cd cryptoBotFrontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Testing
- **Backend endpoint testing**: Use `testBackendEndpoints.js` to verify all API endpoints
- **Kraken API testing**: Use `testKrakenApi.js` to test direct exchange connectivity
- **Performance testing**: Various `testFetch*.js` files for API performance analysis

## Environment Setup

### Required Environment Variables
Create `cryptoBotBackend/.env` with:
```
KRAKEN_API_KEY=your_actual_api_key
KRAKEN_API_SECRET=your_actual_api_secret
```

### Default Configuration
The trading bot includes default API keys in `index.js` for testing, but production use requires real Kraken credentials with appropriate permissions.

## Trading Bot Configuration

### Default Parameters (in `tradingBot.js`)
- **Trading Pair**: XXRPZUSD (XRP/USD)
- **Buy Threshold**: 0.95 (buy if price drops 5%)
- **Sell Threshold**: 1.05 (sell if price rises 5%)
- **Trade Volume**: 10 XRP per transaction
- **Check Interval**: 60 seconds
- **Minimum Holding**: 50 XRP (preservation constraint)
- **RSI Thresholds**: Buy at RSI ≤ 30, Sell at RSI ≥ 70

### API Endpoints for Bot Control
- `POST /api/tradingbot/start`: Start autonomous trading
- `POST /api/tradingbot/stop`: Stop trading bot
- `POST /api/tradingbot/params`: Update bot parameters
- `GET /api/kraken/balance`: Fetch current portfolio
- `GET /api/kraken/prices`: Get cached asset prices (1-minute TTL)

## Key Integration Points

### Kraken API Integration
- **Authentication**: HMAC-SHA512 signature with API key/secret
- **Public endpoints**: Ticker data, OHLC data, asset pairs
- **Private endpoints**: Balance, order placement, account information
- **Rate limiting**: Built-in caching for price data to avoid API limits

### Trading Logic Flow
1. **Price fetching**: Real-time ticker data from Kraken
2. **RSI calculation**: 14-period RSI using 1-minute OHLC data
3. **Signal generation**: Combined RSI and price threshold analysis
4. **Risk assessment**: Fee calculation, tax estimation, minimum holding checks
5. **Order execution**: Market orders through Kraken API
6. **Event emission**: Trade notifications, errors, status updates

### Frontend-Backend Communication
- **REST API**: All frontend-backend communication via HTTP
- **Real-time updates**: Frontend polls backend for status updates
- **State management**: React useState for component state, no external state management

## Development Tips

### Common Development Workflow
1. Start backend server first: `cd cryptoBotBackend && node index.js`
2. Start frontend in separate terminal: `cd cryptoBotFrontend && npm run dev`
3. Use browser dev tools to monitor API calls and responses
4. Check backend console for trading bot events and errors

### Debugging Trading Logic
- Monitor backend console output for trade events and errors
- Use `/api/kraken/ticker/:pair` endpoint to verify price data
- Test RSI calculations with `/api/performance/:pair` historical data
- Verify balance updates after trades via `/api/kraken/balance`

### Testing API Integration
Run `testBackendEndpoints.js` after any backend changes to verify all endpoints remain functional. This includes health checks, balance fetching, order placement, and bot control endpoints.
