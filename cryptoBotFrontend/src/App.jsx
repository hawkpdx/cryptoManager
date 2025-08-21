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
      <h1 className='dashboard-title'>Garrett's Trading Dashboard</h1>
      <img
      src="https://i.etsystatic.com/19730085/r/il/c75fd1/3208736874/il_fullxfull.3208736874_cqv2.jpg"
      alt="xrpLogo"
      />
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
