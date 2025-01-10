const axios = require('axios');
const CryptoPrice = require('../models/CryptoPrice');

const coins = ['bitcoin', 'matic-network', 'ethereum'];
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async function fetchCryptoPrices() {
  try {
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coins.join(','),
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_change: true
      }
    });

    const updates = coins.map(coinId => {
      const data = response.data[coinId];
      return {
        coinId,
        priceUsd: data.usd,
        marketCapUsd: data.usd_market_cap,
        change24h: data.usd_24h_change
      };
    });

    await Promise.all(updates.map(update => 
      new CryptoPrice(update).save()
    ));

    console.log('Cryptocurrency prices updated successfully');
  } catch (error) {
    console.error('Error fetching crypto prices:', error.message);
  }
}

async function getLatestStats(coinId) {
  const latestRecord = await CryptoPrice.findOne({ coinId })
    .sort({ timestamp: -1 })
    .lean();

  if (!latestRecord) {
    throw new Error('No data found for the specified coin');
  }

  return {
    price: latestRecord.priceUsd,
    marketCap: latestRecord.marketCapUsd,
    "24hChange": latestRecord.change24h
  };
}

async function calculatePriceDeviation(coinId) {
  const prices = await CryptoPrice.find({ coinId })
    .sort({ timestamp: -1 })
    .limit(100)
    .select('priceUsd')
    .lean();

  if (prices.length === 0) {
    throw new Error('No data found for the specified coin');
  }

  const priceValues = prices.map(p => p.priceUsd);
  const mean = priceValues.reduce((a, b) => a + b) / priceValues.length;
  const squaredDiffs = priceValues.map(price => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b) / priceValues.length;
  const deviation = Math.sqrt(variance);

  return {
    deviation: Number(deviation.toFixed(2))
  };
}

module.exports = {
  fetchCryptoPrices,
  getLatestStats,
  calculatePriceDeviation
};