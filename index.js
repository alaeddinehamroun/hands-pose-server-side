const WebSocket = require('ws');
const crypto = require('crypto');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });

// Generate a random encryption key and IV
const encryptionKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send encryption key and iv to client
  const message = JSON.stringify({
    encryptionKey: encryptionKey.toString('hex'),
    iv: iv.toString('hex'),
  });
  ws.send(message);

  // Handle incoming messages
  ws.on('message', (message) => {
    const encryptedMessage = JSON.parse(message)
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decryptedMessage = '';

    decipher.on('readable', () => {
      let chunk;
      while (null !== (chunk = decipher.read())) {
        decryptedMessage += chunk.toString('utf8');
      }
    });

    decipher.on('end', () => {
      console.log(`Received message from client: ${decryptedMessage}`);
    });
    decipher.write(encryptedMessage, 'base64');
    decipher.end();
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// function decryptMessage(message) {
//   const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
//   let decrypted = decipher.update(message, 'base64', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }

// function encryptMessage(message) {
//   const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
//   let encrypted = cipher.update(message, 'utf8', 'base64');
//   encrypted += cipher.final('base64');
//   return encrypted;
// }
