#!/bin/bash

# Test backend API endpoints

echo "Testing /api/health"
curl -s http://localhost:3001/api/health | jq

echo "Testing /api/kraken/balance"
curl -s http://localhost:3001/api/kraken/balance | jq

echo "Testing /api/kraken/order/buy with invalid data"
curl -s -X POST http://localhost:3001/api/kraken/order/buy -H "Content-Type: application/json" -d '{"pair":"XXRPZUSD","ordertype":"limit","volume":0,"price":0}' | jq

echo "Testing /api/kraken/order/sell with invalid data"
curl -s -X POST http://localhost:3001/api/kraken/order/sell -H "Content-Type: application/json" -d '{"pair":"XXRPZUSD","ordertype":"limit","volume":0,"price":0}' | jq

echo "Testing /api/kraken/pair/minvolume/XXRPZUSD"
curl -s http://localhost:3001/api/kraken/pair/minvolume/XXRPZUSD | jq

echo "Testing /api/tradingbot/start"
curl -s -X POST http://localhost:3001/api/tradingbot/start | jq

echo "Testing /api/tradingbot/params"
curl -s -X POST http://localhost:3001/api/tradingbot/params -H "Content-Type: application/json" -d '{"pair":"XXRPZUSD","buyThreshold":0.95,"sellThreshold":1.05,"tradeVolume":10,"checkInterval":60000,"minHolding":50,"makerFeeRate":0.0016,"takerFeeRate":0.0026,"estimatedTaxRate":0.15}' | jq

echo "Testing /api/tradingbot/stop"
curl -s -X POST http://localhost:3001/api/tradingbot/stop | jq

echo "Testing /api/performance/XXRPZUSD"
curl -s http://localhost:3001/api/performance/XXRPZUSD | jq

echo "Testing /api/kraken/ticker/XXRPZUSD"
curl -s http://localhost:3001/api/kraken/ticker/XXRPZUSD | jq

echo "Testing /api/kraken/prices"
curl -s http://localhost:3001/api/kraken/prices | jq
