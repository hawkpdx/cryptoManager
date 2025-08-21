import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#663399', '#339966', '#FF6666'];

// Helper function to map asset symbol to Kraken pair
const mapAssetToPair = (asset) => {
  // Kraken asset prefixes: X for crypto, Z for fiat, sometimes double letters
  // Common pairs end with ZUSD (USD fiat)
  // Examples: XXRPZUSD, XETHZUSD, XXBTZUSD
  if (asset === 'ZUSD') return 'ZUSD'; // USD fiat itself
  if (asset.startsWith('X') || asset.startsWith('Z')) {
    // Already prefixed, try asset + 'ZUSD'
    return asset + 'ZUSD';
  }
  // Add prefix X for crypto assets, Z for fiat assets
  if (['USD', 'EUR', 'GBP', 'JPY'].includes(asset)) {
    return 'Z' + asset + 'ZUSD';
  }
  return 'X' + asset + 'ZUSD';
};

const Portfolio = () => {
  const [balance, setBalance] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balanceResponse = await axios.get('http://localhost:3001/api/kraken/balance');
        const pricesResponse = await axios.get('http://localhost:3001/api/kraken/prices');
        setBalance(balanceResponse.data.balance);
        setPrices(pricesResponse.data);
      } catch (err) {
        console.error('Error fetching balance or prices:', err);
        setError('Failed to fetch balance or prices');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading portfolio...</div>;
  if (error) return <div>{error}</div>;

  // Prepare data for pie chart
  const data = balance
    ? Object.entries(balance).map(([asset, amount]) => ({
        name: asset,
        value: parseFloat(amount).toFixed(2),
      }))
    : [];

  // Calculate total balance in USD using fetched prices
  const totalBalanceUSD = balance
    ? Object.entries(balance).reduce((total, [asset, amount]) => {
        const pair = mapAssetToPair(asset);
        const price = prices[pair];
        // Handle missing or zero price gracefully
        if (!price || isNaN(price)) {
          return total;
        }
        return total + parseFloat(amount) * price;
      }, 0)
    : 0;

  return (
    <div>
      <h2>Portfolio Balance</h2>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Total Balance: ${totalBalanceUSD.toFixed(2)}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <ul>
        {balance && Object.entries(balance).map(([asset, amount]) => (
          <li key={asset}>
            {asset}: {parseFloat(amount).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portfolio;
