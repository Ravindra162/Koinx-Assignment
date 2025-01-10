const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cryptoService = require('./services/cryptoService');
const cryptoRoutes = require('./routes/cryptoRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schedule background job to run every 2 hours
// cron.schedule('0 */2 * * *', () => {
//   console.log('Running scheduled crypto price update');
//   cryptoService.fetchCryptoPrices();
// });

// Routes
app.use(express.json());
app.use('/', cryptoRoutes);

// Initial fetch when server starts
cryptoService.fetchCryptoPrices();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});