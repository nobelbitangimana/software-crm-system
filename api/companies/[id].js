// Vercel serverless function for individual company operations
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

  const { id } = req.query;

  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        const company = await Company.findById(id);
        if (!company) {
          return res.status(404).json({ message: 'Company not found' });
        }
        return res.status(200).json(company);

      case 'PUT':
        const updatedCompany = await Company.findByIdAndUpdate(
          id,
          { ...req.body, updatedAt: new Date() },
          { new: true }
        );
        if (!updatedCompany) {
          return res.status(404).json({ message: 'Company not found' });
        }
        return res.status(200).json(updatedCompany);

      case 'DELETE':
        const deletedCompany = await Company.findByIdAndDelete(id);
        if (!deletedCompany) {
          return res.status(404).json({ message: 'Company not found' });
        }
        return res.status(200).json({ message: 'Company deleted successfully' });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Company API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}