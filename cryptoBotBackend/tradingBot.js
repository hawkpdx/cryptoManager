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
            estimatedTaxRate: 0.15 // 15% estimated tax on profits
        };
        this.lastPrice = null;
        this.intervalId = null;
    }

    async fetchCurrentPrice() {
        try {
            const tickerData = await this.krakenClient.getTicker(this.params.pair);
            // The tickerData is an object with pair as key, e.g. { XXRPZUSD: { c: [ '0.5', '1', '1.0' ], ... } }
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

    async checkAndTrade() {
        const currentPrice = await this.fetchCurrentPrice();
        if (!currentPrice) return;

        if (this.lastPrice === null) {
            this.lastPrice = currentPrice;
            return;
        }

        if (currentPrice <= this.lastPrice * this.params.buyThreshold) {
            // Buy signal
            try {
                // Check current balance before buying
                const balance = await this.krakenClient.getBalance();
                const xrpBalance = parseFloat(balance['XXRP'] || '0');

                // Calculate estimated fees and tax for buy
                const estimatedFee = this.params.tradeVolume * currentPrice * this.params.takerFeeRate;
                // For buy, tax impact is zero as no profit realized yet
                const estimatedTax = 0;

                // Check if buying is worth it (no tax on buy, so just check min holding)
                if (xrpBalance + this.params.tradeVolume >= this.params.minHolding) {
                    const order = await this.krakenClient.placeOrder({
                        pair: this.params.pair,
                        type: 'buy',
                        ordertype: 'market',
                        volume: this.params.tradeVolume.toString()
                    });
                    this.emit('trade', { type: 'buy', price: currentPrice, order, estimatedFee, estimatedTax });
                } else {
                    this.emit('info', `Buy skipped to preserve minimum holding: ${this.params.minHolding} XRP`);
                }
            } catch (error) {
                this.emit('error', error);
            }
        } else if (currentPrice >= this.lastPrice * this.params.sellThreshold) {
            // Sell signal
            try {
                // Check current balance before selling
                const balance = await this.krakenClient.getBalance();
                const xrpBalance = parseFloat(balance['XXRP'] || '0');

                // Calculate estimated fees and tax for sell
                const estimatedFee = this.params.tradeVolume * currentPrice * this.params.takerFeeRate;
                // Estimate profit per unit
                const profitPerUnit = currentPrice - this.lastPrice;
                const estimatedProfit = profitPerUnit * this.params.tradeVolume;
                const estimatedTax = estimatedProfit > 0 ? estimatedProfit * this.params.estimatedTaxRate : 0;

                // Confirm if trade is worth it after fees and tax
                if (xrpBalance - this.params.tradeVolume >= this.params.minHolding && (estimatedProfit - estimatedFee - estimatedTax) > 0) {
                    const order = await this.krakenClient.placeOrder({
                        pair: this.params.pair,
                        type: 'sell',
                        ordertype: 'market',
                        volume: this.params.tradeVolume.toString()
                    });
                    this.emit('trade', { type: 'sell', price: currentPrice, order, estimatedFee, estimatedTax });
                } else {
                    this.emit('info', `Sell skipped due to fees/tax or minimum holding constraints.`);
                }
            } catch (error) {
                this.emit('error', error);
            }
        }

        this.lastPrice = currentPrice;
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

module.exports = TradingBot;
