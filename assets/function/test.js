const express = require('express');
const app = express();

// Allow all origins
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Your routes and other middleware setup

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
