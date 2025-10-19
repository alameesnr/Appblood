const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: ['http://172.20.10.2:8080', 'https://blood-bridge-naija.lovable.app/'], // add your frontend URL
  credentials: true,
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
