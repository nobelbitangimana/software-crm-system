// Vercel serverless function for contacts CRUD
const mongoose = require('mongoose');

// Contact Schema
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  position: String,
  status: { type: String, default: 'active' },
  source: String,
  tags: [String],
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let Contact;
try {
  Contact = mongoose.model('Contact');
} catch {
  Contact = mongoose.model('Contact', contactSchema);
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
        const contacts = await Contact.find().sort({ createdAt: -1 });
        return res.status(200).json(contacts);

      case 'POST':
        const newContact = new Contact({
          ...req.body,
          updatedAt: new Date()
        });
        const savedContact = await newContact.save();
        return res.status(201).json(savedContact);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Contacts API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}