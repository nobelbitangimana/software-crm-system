const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, '127.0.0.1', () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
  });
}

async function findAvailablePort(startPort = 3001) {
  console.log(`🔍 Searching for available port starting from ${startPort}...`);
  
  for (let port = startPort; port <= startPort + 50; port++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      console.log(`✅ Found available port: ${port}`);
      return port;
    } else {
      console.log(`❌ Port ${port} is in use`);
    }
  }
  throw new Error(`No available port found in range ${startPort}-${startPort + 50}`);
}

module.exports = { findAvailablePort };