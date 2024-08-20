const express = require('express');
const app = express();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const port = 5000;
const generalRouter = require('./routes/general');
const adminRouter = require('./routes/admin');

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with your frontend URL
        methods: ["GET", "POST"]
    }
});

let sessionLogs = [];

const addLog = (message) => {
    const log = { timestamp: new Date(), message };
    sessionLogs.push(log);
    if (sessionLogs.length > 10) {
        sessionLogs.shift(); // Remove the oldest log if we have more than 10
    }
    io.emit('new_log', log);
};

io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Send initial logs to the newly connected client
    socket.emit('initial_logs', sessionLogs);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get('/', (req, res) => {
    res.send('Server connection established!!');
});

const uri = "mongodb+srv://nigelcolaco12:nigel@cluster0.hicqymk.mongodb.net/ONGC";
mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch(error => console.error("Error connecting to MongoDB:", error));

// Middleware to attach io and addLog to req object
app.use((req, res, next) => {
    req.io = io;
    req.addLog = addLog;
    next();
});

app.use('/general', generalRouter);
app.use('/admin', adminRouter);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});