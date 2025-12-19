# 🍃 MongoDB Setup Guide for CRM System

## After Installing MongoDB - Complete Setup Steps

### 1️⃣ Start MongoDB Service

#### On Windows:
```bash
# Option 1: Start as Windows Service (if installed as service)
net start MongoDB

# Option 2: Start manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

#### On macOS:
```bash
# If installed via Homebrew
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

#### On Linux:
```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod  # Enable auto-start on boot
```

### 2️⃣ Verify MongoDB is Running

```bash
# Check if MongoDB is accessible
mongosh --eval "db.adminCommand('ismaster')"
```

You should see output indicating MongoDB is running on port 27017.

### 3️⃣ Create Database and Initial User (Optional but Recommended)

```bash
# Connect to MongoDB
mongosh

# Switch to your CRM database
use crm

# Create an admin user for your CRM database
db.createUser({
  user: "crmadmin",
  pwd: "your_secure_password_here",
  roles: [
    { role: "readWrite", db: "crm" },
    { role: "dbAdmin", db: "crm" }
  ]
})
```

### 4️⃣ Update CRM Configuration

#### Option A: Use Default Connection (Recommended for Development)
Your CRM is already configured to use `mongodb://localhost:27017/crm` - no changes needed!

#### Option B: Use Authentication (Recommended for Production)
If you created a user in step 3, update `server/.env`:

```env
MONGODB_URI=mongodb://crmadmin:your_secure_password_here@localhost:27017/crm
```

### 5️⃣ Restart Your CRM System

```bash
# Stop current processes (if running)
# Then restart both server and client

# In server directory:
npm start

# In client directory (new terminal):
npm start
```

### 6️⃣ Verify MongoDB Connection

When you restart the server, you should see:
```
✅ MongoDB connected successfully
```

Instead of:
```
⚠️ MongoDB Connection Failed!
🔄 Starting in DEMO MODE
```

### 7️⃣ Migrate Demo Data to MongoDB (Optional)

If you want to keep the demo data you created, I can create a migration script. The system will start with an empty database by default.

### 8️⃣ Create Your First Real User

Once MongoDB is connected, you can:

1. **Use the existing demo users** (they'll be created in MongoDB automatically)
2. **Register new users** via the API or create them directly in MongoDB

## 🔧 Troubleshooting

### MongoDB Won't Start
```bash
# Check if port 27017 is in use
netstat -an | findstr :27017

# Check MongoDB logs
# Windows: C:\Program Files\MongoDB\Server\7.0\log\mongod.log
# macOS/Linux: /usr/local/var/log/mongodb/mongo.log
```

### Connection Issues
1. **Firewall**: Ensure port 27017 is not blocked
2. **Path Issues**: Verify MongoDB data directory exists and has proper permissions
3. **Service Status**: Check if MongoDB service is actually running

### Authentication Errors
If using authentication, ensure:
- Username/password are correct in MONGODB_URI
- User has proper permissions on the 'crm' database

## 🎯 What Changes After MongoDB Setup

### ✅ Benefits of Full MongoDB
- **Persistent Data**: Data survives server restarts
- **Better Performance**: Optimized queries and indexing
- **Scalability**: Handle larger datasets
- **Advanced Features**: Aggregation, transactions, etc.
- **Production Ready**: Suitable for real-world use

### 🔄 Automatic Transition
Your CRM automatically detects MongoDB availability:
- **MongoDB Available**: Uses full database features
- **MongoDB Unavailable**: Falls back to demo mode

No code changes needed - the system handles both modes seamlessly!

## 🚀 Next Steps After MongoDB Setup

1. **Test the Connection**: Restart your CRM and verify MongoDB connection
2. **Create Real Data**: Start adding your actual contacts, deals, etc.
3. **Setup Backups**: Configure regular MongoDB backups
4. **Security**: Consider enabling MongoDB authentication for production
5. **Monitoring**: Set up MongoDB monitoring tools

## 📞 Need Help?

If you encounter any issues:
1. Check the server logs for MongoDB connection errors
2. Verify MongoDB service is running
3. Test MongoDB connection with `mongosh`
4. Check firewall and network settings

Your CRM system is designed to work seamlessly with or without MongoDB!