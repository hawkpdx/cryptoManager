import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceTracker = ({ pair }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        // Example API endpoint for historical performance data
        const response = await axios.get(`http://localhost:3001/api/performance/${pair}`);
        setData(response.data);
      } catch {
        setError('Failed to fetch performance data');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformanceData();
  }, [pair]);

  if (loading) return <div>Loading performance data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Performance Tracker for {pair}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceTracker;
