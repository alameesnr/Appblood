const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://172.20.10.2:8080', 'https://blood-bridge-naija.lovable.app'],
  credentials: true,
}));

app.use(express.json());

// Add a test route to check if server is working
app.get('/', (req, res) => {
  res.json({ message: 'Blood Bridge API is running!' });
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Only one app.listen() call
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));