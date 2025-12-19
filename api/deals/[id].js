// Vercel serverless function for individual deal operations
const mongoose = require('mongoose');

// Deal Schema
const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  contact: String,
  value: { type: Number, required: true },
  stage: { type: String, default: 'lead' },
  probability: { type: Number, default: 0 },
  expectedCloseDate: Date,
  arr: Number,
  mrr: Number,
  dealType: { type: String, default: 'new-business' },
  status: { type: String, default: 'active' },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let Deal;
try {
  Deal = mongoose.model('Deal');
} catch {
  Deal = mongoose.model('Deal', dealSchema);
}

// Connect to MongoDB
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedConnection = connection;
  return connection;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        const deal = await Deal.findById(id);
        if (!deal) {
          return res.status(404).json({ message: 'Deal not found' });
        }
        return res.status(200).json(deal);

      case 'PUT':
        const updatedDeal = await Deal.findByIdAndUpdate(
          id,
          { ...req.body, updatedAt: new Date() },
          { new: true }
        );
        if (!updatedDeal) {
          return res.status(404).json({ message: 'Deal not found' });
        }
        return res.status(200).json(updatedDeal);

      case 'DELETE':
        const deletedDeal = await Deal.findByIdAndDelete(id);
        if (!deletedDeal) {
          return res.status(404).json({ message: 'Deal not found' });
        }
        return res.status(200).json({ message: 'Deal deleted successfully' });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Deal API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}