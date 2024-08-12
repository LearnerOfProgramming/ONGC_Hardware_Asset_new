const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 5000; // Port

const generalRouter = require('./routes/general');
const adminRouter = require('./routes/admin');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server connection established!!');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


const uri = process.env.NODE_ENV === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_TEST;

mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch(error => console.error("Error connecting to MongoDB:", error));

app.use('/general', generalRouter); 
app.use('/admin', adminRouter);
