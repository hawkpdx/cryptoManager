import React, { useState } from 'react';
import './App.css';
import Portfolio from './components/Portfolio';
import MarketData from './components/MarketData';
import TradingControls from './components/TradingControls';
import PerformanceTracker from './components/PerformanceTracker';

function App() {
  const [selectedPair, setSelectedPair] = useState('XXRPZUSD');

  return (
    <div className="App">
      <h1>Garrett's Trading Dashboard</h1>
      <Portfolio />
      <div>
        <label htmlFor="pair-select">Select Trading Pair: </label>
        <select
          id="pair-select"
          value={selectedPair}
          onChange={(e) => setSelectedPair(e.target.value)}
        >
          <option value="XXRPZUSD">XRP/USD</option>
          <option value="XXBTZUSD">BTC/USD</option>
          <option value="XETHZUSD">ETH/USD</option>
        </select>
      </div>
      <MarketData pair={selectedPair} />
      <PerformanceTracker pair={selectedPair} />
      <TradingControls />
    </div>
  );
}

export default App;
