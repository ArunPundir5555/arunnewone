import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 6000;
app.use(cors());
app.use(express.json());

// Auth route
app.post('/api/authenticate', async (req, res) => {
  const { address, message, signature } = req.body;

  if (!address || !message || !signature) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature mismatch' });
    }

    // Signature is valid — issue JWT token
    const token = jwt.sign({ address }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({ success: true, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
