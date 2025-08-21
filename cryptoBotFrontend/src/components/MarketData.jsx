import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MarketData = ({ pair }) => {
  const [ticker, setTicker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/kraken/ticker/" + pair);
        // Kraken ticker response has pair key, e.g. XXRPZUSD, with nested object
        // Extract the nested object for rendering
        const pairKey = Object.keys(response.data)[0];
        setTicker(response.data[pairKey]);
      } catch {
        setError('Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    };
    fetchTicker();
  }, [pair]);

  if (loading) return <div>Loading market data...</div>;
  if (error) return <div>{error}</div>;

  const keyDescriptions = {
    a: "Ask Price, Whole Lot Volume, Lot Volume",
    b: "Bid Price, Whole Lot Volume, Lot Volume",
    c: "Last Trade Closed Price, Lot Volume",
    v: "Volume Today, Volume Last 24 Hours",
    p: "Volume Weighted Average Price Today, Last 24 Hours",
    t: "Number of Trades Today, Last 24 Hours",
    l: "Low Price Today, Last 24 Hours",
    h: "High Price Today, Last 24 Hours",
    o: "Opening Price Today"
  };

  return (
    <div>
      <h2>Market Data for {pair}</h2>
      <ul>
        {ticker && Object.entries(ticker).map(([key, value]) => (
          <li key={key}>
            {keyDescriptions[key] || key}: {Array.isArray(value) ? value.map(v => typeof v === 'number' ? v.toFixed(2) : v).join(', ') : (typeof value === 'number' ? value.toFixed(2) : value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MarketData;
