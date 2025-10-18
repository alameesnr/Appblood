const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const transporter = require('../config/mailer');
const router = express.Router();

// Helper to send verification email
const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    from: `"Bloodridge Naija" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your Bloodridge account',
    html: `<p>Your verification code is: <b>${code}</b>. It expires in 15 minutes.</p>`,
  });
};

// Signup route
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

    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match.' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: 'Email already registered.' });

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

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
      verificationCode,
      verificationExpires: Date.now() + 15 * 60 * 1000, // 15 min expiry
    });

    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: 'Signup successful. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify email route
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found.' });

    if (user.isVerified)
      return res.status(400).json({ message: 'Email already verified.' });

    if (
      user.verificationCode !== code ||
      Date.now() > user.verificationExpires
    ) {
      return res.status(400).json({ error: 'Invalid or expired code.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    if (!user.isVerified)
      return res.status(401).json({ error: 'Please verify your email before login.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified.' });

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationCode = newCode;
    user.verificationExpires = Date.now() + 15 * 60 * 1000; // expires in 15 min
    await user.save();

    await transporter.sendMail({
      from: `"Bloodridge Naija" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Your new Bloodridge verification code',
      html: `<p>Your new verification code is <b>${newCode}</b>. It expires in 15 minutes.</p>`,
    });

    res.status(200).json({ message: 'New verification code sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
