const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 5000; // Port

const generalRouter = require('./routes/general');
const adminRouter = require('./routes/admin');

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Server connection established!!');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

const uri = "mongodb+srv://nigelcolaco12:nigel@cluster0.hicqymk.mongodb.net/ONGC";

mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch(error => console.error("Error connecting to MongoDB:", error));

app.use('/general', generalRouter); 
app.use('/admin', adminRouter);

