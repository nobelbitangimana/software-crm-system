// Vercel serverless function for individual contact operations
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

  const { id } = req.query;

  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        const contact = await Contact.findById(id);
        if (!contact) {
          return res.status(404).json({ message: 'Contact not found' });
        }
        return res.status(200).json(contact);

      case 'PUT':
        const updatedContact = await Contact.findByIdAndUpdate(
          id,
          { ...req.body, updatedAt: new Date() },
          { new: true }
        );
        if (!updatedContact) {
          return res.status(404).json({ message: 'Contact not found' });
        }
        return res.status(200).json(updatedContact);

      case 'DELETE':
        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) {
          return res.status(404).json({ message: 'Contact not found' });
        }
        return res.status(200).json({ message: 'Contact deleted successfully' });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}