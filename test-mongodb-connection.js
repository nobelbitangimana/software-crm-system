hconst mongoose = require('mongoose');

// Replace with your actual connection string from MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://bitangimanaalainnobel_db_user:wnwPf2wbfep96edr@cluster0.lifsbo1.mongodb.net/crm?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    console.log('🌐 Connecting to:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000
    });
    
    console.log('\n✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    
    // Test a simple operation
    console.log('\n🧪 Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    
    if (collections.length > 0) {
      console.log('📋 Collection names:', collections.map(c => c.name).join(', '));
    } else {
      console.log('📋 No collections yet (this is normal for new databases)');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed successfully');
    console.log('🎉 MongoDB Atlas is ready for your CRM system!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check your username and password in the connection string');
      console.log('   2. Verify the database user exists in Atlas Dashboard → Database Access');
      console.log('   3. Make sure the password doesn\'t contain special characters that need encoding');
    } else if (error.message.includes('IP address')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Go to Atlas Dashboard → Network Access');
      console.log('   2. Add your current IP address or use 0.0.0.0/0 for all IPs');
      console.log('   3. Wait a few minutes for the changes to take effect');
    } else if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the cluster hostname in your connection string');
      console.log('   3. Try connecting from a different network');
    } else {
      console.log('\n💡 General troubleshooting:');
      console.log('   1. Double-check your connection string format');
      console.log('   2. Ensure your cluster is not paused in Atlas Dashboard');
      console.log('   3. Try creating a new database user');
    }
    
    console.log('\n📚 For detailed setup instructions, see: MONGODB-ATLAS-SETUP.md');
  }
}

// Instructions
console.log('🔧 MongoDB Atlas Connection Test');
console.log('================================\n');
console.log('Before running this test:');
console.log('1. Update the MONGODB_URI variable above with your actual connection string');
console.log('2. Make sure you have completed the MongoDB Atlas setup');
console.log('3. Ensure your IP is whitelisted in Network Access\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Have you updated the MONGODB_URI in this file? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    rl.close();
    testConnection();
  } else {
    console.log('\nPlease update the MONGODB_URI variable at the top of this file with your connection string from MongoDB Atlas.');
    console.log('The connection string should look like:');
    console.log('mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/crm?retryWrites=true&w=majority\n');
    rl.close();
  }
});