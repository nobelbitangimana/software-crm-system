// Vercel serverless function for companies CRUD
const mongoose = require('mongoose');

// Company Schema
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: String,
  size: String,
  website: String,
  phone: String,
  email: String,
  address: String,
  techStack: [String],
  status: { type: String, default: 'active' },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let Company;
try {
  Company = mongoose.model('Company');
} catch {
  Company = mongoose.model('Company', companySchema);
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

  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        const companies = await Company.find().sort({ createdAt: -1 });
        return res.status(200).json(companies);

      case 'POST':
        const newCompany = new Company({
          ...req.body,
          updatedAt: new Date()
        });
        const savedCompany = await newCompany.save();
        return res.status(201).json(savedCompany);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Companies API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}