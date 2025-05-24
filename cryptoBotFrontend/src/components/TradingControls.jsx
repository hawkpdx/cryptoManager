import React, { useState } from 'react';
import axios from 'axios';

const TradingControls = () => {
  const [pair, setPair] = useState('XXRPZUSD');
  const [buyThreshold, setBuyThreshold] = useState(0.95);
  const [sellThreshold, setSellThreshold] = useState(1.05);
  const [tradeVolume, setTradeVolume] = useState(10);
  const [checkInterval, setCheckInterval] = useState(60000);
  const [minHolding, setMinHolding] = useState(50);
  const [makerFeeRate, setMakerFeeRate] = useState(0.0016);
  const [takerFeeRate, setTakerFeeRate] = useState(0.0026);
  const [estimatedTaxRate, setEstimatedTaxRate] = useState(0.15);
  const [status, setStatus] = useState('stopped');

  const updateParams = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/tradingbot/params', {
        pair,
        buyThreshold,
        sellThreshold,
        tradeVolume,
        checkInterval,
        minHolding,
        makerFeeRate,
        takerFeeRate,
        estimatedTaxRate,
      });
      console.log('Params updated:', response.data);
    } catch (error) {
      console.error('Error updating params:', error);
    }
  };

  const startBot = async () => {
    try {
      await axios.post('http://localhost:3001/api/tradingbot/start');
      setStatus('running');
    } catch (error) {
      console.error('Error starting bot:', error);
    }
  };

  const stopBot = async () => {
    try {
      await axios.post('http://localhost:3001/api/tradingbot/stop');
      setStatus('stopped');
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  };

  const tooltipStyle = {
    borderBottom: '1px dotted black',
    cursor: 'help',
    marginLeft: '5px',
  };

  return (
    <div>
      <h2>Trading Bot Controls</h2>
      <div>
        <label>
          Trading Pair:
          <span style={tooltipStyle} title="Select the cryptocurrency trading pair to trade, e.g., XRP/USD.">?</span>
        </label>
        <select value={pair} onChange={(e) => setPair(e.target.value)}>
          <option value="XXRPZUSD">XRP/USD</option>
          <option value="XXBTZUSD">BTC/USD</option>
          <option value="XETHZUSD">ETH/USD</option>
        </select>
      </div>
      <div>
        <label>
          Buy Threshold:
          <span style={tooltipStyle} title="Price ratio below which the bot will buy, e.g., 0.95 means buy if price drops 5%.">?</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={buyThreshold}
          onChange={(e) => setBuyThreshold(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>
          Sell Threshold:
          <span style={tooltipStyle} title="Price ratio above which the bot will sell, e.g., 1.05 means sell if price rises 5%.">?</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={sellThreshold}
          onChange={(e) => setSellThreshold(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>
          Trade Volume:
          <span style={tooltipStyle} title="Amount of cryptocurrency to buy or sell per trade.">?</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={tradeVolume}
          onChange={(e) => setTradeVolume(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>
          Check Interval (ms):
          <span style={tooltipStyle} title="How often (in milliseconds) the bot checks market prices to decide trades.">?</span>
        </label>
        <input
          type="number"
          value={checkInterval}
          onChange={(e) => setCheckInterval(parseInt(e.target.value, 10))}
        />
      </div>
      <div>
        <label>
          Minimum XRP Holding:
          <span style={tooltipStyle} title="Minimum amount of XRP to keep in your balance, preventing the bot from selling below this.">?</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={minHolding}
          onChange={(e) => setMinHolding(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>
          Maker Fee Rate:
          <span style={tooltipStyle} title="Trading fee rate for maker orders (limit orders), e.g., 0.0016 means 0.16%.">?</span>
        </label>
        <input
          type="number"
          step="0.0001"
          value={makerFeeRate}
          onChange={(e) => setMakerFeeRate(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>
          Taker Fee Rate:
          <span style={tooltipStyle} title="Trading fee rate for taker orders (market orders), e.g., 0.0026 means 0.26%.">?</span>
        </label>
        <input
          type="number"
          step="0.0001"
          value={takerFeeRate}
          onChange={(e) => setTakerFeeRate(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>
          Estimated Tax Rate:
          <span style={tooltipStyle} title="Estimated tax rate on trading profits, e.g., 0.15 means 15%.">?</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={estimatedTaxRate}
          onChange={(e) => setEstimatedTaxRate(parseFloat(e.target.value))}
        />
      </div>
      <button onClick={updateParams}>Update Parameters</button>
      <button onClick={startBot} disabled={status === 'running'}>Start Bot</button>
      <button onClick={stopBot} disabled={status === 'stopped'}>Stop Bot</button>
      <p>Status: {status}</p>
    </div>
  );
};

export default TradingControls;
