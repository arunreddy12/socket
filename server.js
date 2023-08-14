const fs = require('fs');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origins: ["*"],
  },
});
const port =process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('chat message', (msg) => {
      console.log('Received message:', msg);
  
      // Write the message to the JSON file
      const messageData = {
        message: msg.message,
        canid:msg.canid,
        roomid:msg.roomid,
        timestamp: new Date().toISOString()
      };
  
      fs.readFile('chatMessages.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
  
        let messages = JSON.parse(data) || [];
        messages.push(messageData);
  
        fs.writeFile('chatMessages.json', JSON.stringify(messages, null, 2), 'utf8', (err) => {
          if (err) {
            console.error('Error writing file:', err);
            return;
          }
        });
  
        io.emit('chat message', messageData);
      });
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });


app.get("/api/data", (req, res) => {
    fs.readFile('chatMessages.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
        let parse  = JSON.parse(data)
        res.json(parse);
    })
});
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
