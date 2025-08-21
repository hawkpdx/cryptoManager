const EventEmitter = require('events');

class TradingBot extends EventEmitter {
    constructor(krakenClient) {
        super();
        this.krakenClient = krakenClient;
        this.isRunning = false;
        this.params = {
            pair: 'XXRPZUSD',
            buyThreshold: 0.95,  // example: buy if price drops 5%
            sellThreshold: 1.05, // example: sell if price rises 5%
            tradeVolume: 10,     // volume to trade
            checkInterval: 60000, // check every 60 seconds
            minHolding: 50,      // minimum XRP holding to preserve
            makerFeeRate: 0.0016, // 0.16% maker fee default
            takerFeeRate: 0.0026, // 0.26% taker fee default
            estimatedTaxRate: 0.15, // 15% estimated tax on profits
            rsiPeriod: 14,       // RSI calculation period
            buyRSIThreshold: 30, // RSI buy threshold
            sellRSIThreshold: 70 // RSI sell threshold
        };
        this.lastPrice = null;
        this.intervalId = null;
    }

    calculateRSI(closingPrices) {
        if (!Array.isArray(closingPrices) || closingPrices.length < this.params.rsiPeriod + 1) {
            throw new Error('Not enough data to calculate RSI');
        }

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= this.params.rsiPeriod; i++) {
            const delta = closingPrices[i] - closingPrices[i - 1];
            if (delta > 0) {
                gains += delta;
            } else {
                losses -= delta;
            }
        }

        let averageGain = gains / this.params.rsiPeriod;
        let averageLoss = losses / this.params.rsiPeriod;

        for (let i = this.params.rsiPeriod + 1; i < closingPrices.length; i++) {
            const delta = closingPrices[i] - closingPrices[i - 1];
            if (delta > 0) {
                averageGain = (averageGain * (this.params.rsiPeriod - 1) + delta) / this.params.rsiPeriod;
                averageLoss = (averageLoss * (this.params.rsiPeriod - 1)) / this.params.rsiPeriod;
            } else {
                averageGain = (averageGain * (this.params.rsiPeriod - 1)) / this.params.rsiPeriod;
                averageLoss = (averageLoss * (this.params.rsiPeriod - 1) - delta) / this.params.rsiPeriod;
            }
        }

        if (averageLoss === 0) {
            return 100;
        }

        const rs = averageGain / averageLoss;
        const rsi = 100 - 100 / (1 + rs);
        return rsi;
    }

    async fetchRSI() {
        try {
            const ohlcData = await this.krakenClient.getOHLC(this.params.pair, 1); // 1-minute interval
            const pairKey = Object.keys(ohlcData)[0];
            if (!pairKey || !Array.isArray(ohlcData[pairKey])) {
                throw new Error('Invalid OHLC data structure');
            }
            const closingPrices = ohlcData[pairKey].map(candle => parseFloat(candle[4])); // close price is index 4
            const rsi = this.calculateRSI(closingPrices);
            return rsi;
        } catch (error) {
            this.emit('error', error);
            return null;
        }
    }

    async checkAndTrade() {
        const currentPrice = await this.fetchCurrentPrice();
        if (!currentPrice) return;

        const rsi = await this.fetchRSI();
        if (rsi === null) return;

        if (this.lastPrice === null) {
            this.lastPrice = currentPrice;
            return;
        }

        // RSI-based buy signal
        if (rsi <= this.params.buyRSIThreshold) {
            try {
                const balance = await this.krakenClient.getBalance();
                const xrpBalance = parseFloat(balance['XXRP'] || '0');

                const estimatedFee = this.params.tradeVolume * currentPrice * this.params.takerFeeRate;
                const estimatedTax = 0;

                if (xrpBalance + this.params.tradeVolume >= this.params.minHolding) {
                    const order = await this.krakenClient.placeOrder({
                        pair: this.params.pair,
                        type: 'buy',
                        ordertype: 'market',
                        volume: this.params.tradeVolume.toString()
                    });
                    this.emit('trade', { type: 'buy', price: currentPrice, order, estimatedFee, estimatedTax, rsi });
                } else {
                    this.emit('info', `Buy skipped to preserve minimum holding: ${this.params.minHolding} XRP`);
                }
            } catch (error) {
                this.emit('error', error);
            }
        }
        // RSI-based sell signal
        else if (rsi >= this.params.sellRSIThreshold) {
            try {
                const balance = await this.krakenClient.getBalance();
                const xrpBalance = parseFloat(balance['XXRP'] || '0');

                const estimatedFee = this.params.tradeVolume * currentPrice * this.params.takerFeeRate;
                const profitPerUnit = currentPrice - this.lastPrice;
                const estimatedProfit = profitPerUnit * this.params.tradeVolume;
                const estimatedTax = estimatedProfit > 0 ? estimatedProfit * this.params.estimatedTaxRate : 0;

                if (xrpBalance - this.params.tradeVolume >= this.params.minHolding && (estimatedProfit - estimatedFee - estimatedTax) > 0) {
                    const order = await this.krakenClient.placeOrder({
                        pair: this.params.pair,
                        type: 'sell',
                        ordertype: 'market',
                        volume: this.params.tradeVolume.toString()
                    });
                    this.emit('trade', { type: 'sell', price: currentPrice, order, estimatedFee, estimatedTax, rsi });
                } else {
                    this.emit('info', `Sell skipped due to fees/tax or minimum holding constraints.`);
                }
            } catch (error) {
                this.emit('error', error);
            }
        }
        // Fallback to price threshold-based trading if RSI signals are not triggered
        else if (currentPrice <= this.lastPrice * this.params.buyThreshold) {
            try {
                const balance = await this.krakenClient.getBalance();
                const xrpBalance = parseFloat(balance['XXRP'] || '0');

                const estimatedFee = this.params.tradeVolume * currentPrice * this.params.takerFeeRate;
                const estimatedTax = 0;

                if (xrpBalance + this.params.tradeVolume >= this.params.minHolding) {
                    const order = await this.krakenClient.placeOrder({
                        pair: this.params.pair,
                        type: 'buy',
                        ordertype: 'market',
                        volume: this.params.tradeVolume.toString()
                    });
                    this.emit('trade', { type: 'buy', price: currentPrice, order, estimatedFee, estimatedTax, rsi });
                } else {
                    this.emit('info', `Buy skipped to preserve minimum holding: ${this.params.minHolding} XRP`);
                }
            } catch (error) {
                this.emit('error', error);
            }
        } else if (currentPrice >= this.lastPrice * this.params.sellThreshold) {
            try {
                const balance = await this.krakenClient.getBalance();
                const xrpBalance = parseFloat(balance['XXRP'] || '0');

                const estimatedFee = this.params.tradeVolume * currentPrice * this.params.takerFeeRate;
                const profitPerUnit = currentPrice - this.lastPrice;
                const estimatedProfit = profitPerUnit * this.params.tradeVolume;
                const estimatedTax = estimatedProfit > 0 ? estimatedProfit * this.params.estimatedTaxRate : 0;

                if (xrpBalance - this.params.tradeVolume >= this.params.minHolding && (estimatedProfit - estimatedFee - estimatedTax) > 0) {
                    const order = await this.krakenClient.placeOrder({
                        pair: this.params.pair,
                        type: 'sell',
                        ordertype: 'market',
                        volume: this.params.tradeVolume.toString()
                    });
                    this.emit('trade', { type: 'sell', price: currentPrice, order, estimatedFee, estimatedTax, rsi });
                } else {
                    this.emit('info', `Sell skipped due to fees/tax or minimum holding constraints.`);
                }
            } catch (error) {
                this.emit('error', error);
            }
        }

        this.lastPrice = currentPrice;
    }

    async fetchCurrentPrice() {
        try {
            const tickerData = await this.krakenClient.getTicker(this.params.pair);
            const pairKey = Object.keys(tickerData)[0];
            if (!pairKey || !tickerData[pairKey] || !Array.isArray(tickerData[pairKey].c)) {
                throw new Error('Invalid ticker data structure');
            }
            return parseFloat(tickerData[pairKey].c[0]);
        } catch (error) {
            this.emit('error', error);
            return null;
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.intervalId = setInterval(() => this.checkAndTrade(), this.params.checkInterval);
        this.emit('started');
    }

    stop() {
        if (!this.isRunning) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.isRunning = false;
        this.emit('stopped');
    }

    updateParams(newParams) {
        this.params = { ...this.params, ...newParams };
        this.emit('paramsUpdated', this.params);
    }
}

