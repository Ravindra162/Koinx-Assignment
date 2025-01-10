const express = require('express');
const router = express.Router();
const cryptoService = require('../services/cryptoService');

const VALID_COINS = ['bitcoin', 'matic-network', 'ethereum'];

router.get('/stats', async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin || !VALID_COINS.includes(coin)) {
      return res.status(400).json({ 
        error: 'Invalid coin. Must be one of: bitcoin, matic-network, ethereum' 
      });
    }

    const stats = await cryptoService.getLatestStats(coin);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/deviation', async (req, res) => {
  try {
    const { coin } = req.query;
    
    if (!coin || !VALID_COINS.includes(coin)) {
      return res.status(400).json({ 
        error: 'Invalid coin. Must be one of: bitcoin, matic-network, ethereum' 
      });
    }

    const deviation = await cryptoService.calculatePriceDeviation(coin);
    res.json(deviation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;