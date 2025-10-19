const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// 🩸 Signup Route
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      dateOfBirth,
      phoneNumber,
      email,
      gender,
      password,
      confirmPassword,
      bloodGroup,
      genotype,
      medicalCondition,
      lastDonationDate,
      currentLocation,
      preferredDonationRadius,
      preferredDonationCenters,
      agreeToDonate,
      allowContact,
    } = req.body;

    // Validate password match
    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match.' });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: 'Email already registered.' });

    // Create new user
    const user = new User({
      name,
      dateOfBirth,
      phoneNumber,
      email,
      gender,
      password,
      bloodGroup,
      genotype,
      medicalCondition,
      lastDonationDate,
      currentLocation,
      preferredDonationRadius,
      preferredDonationCenters,
      agreeToDonate,
      allowContact,
      isVerified: true, // ✅ Automatically mark verified
    });

    await user.save();

    res.status(201).json({ message: 'Signup successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧩 Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for existing user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: 'Invalid email or password.' });

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ error: 'Invalid email or password.' });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
