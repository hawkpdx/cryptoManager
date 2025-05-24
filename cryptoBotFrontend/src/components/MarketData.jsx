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

  return (
    <div>
      <h2>Market Data for {pair}</h2>
      <ul>
        {ticker && Object.entries(ticker).map(([key, value]) => (
          <li key={key}>
            {key}: {Array.isArray(value) ? value.join(', ') : value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MarketData;
