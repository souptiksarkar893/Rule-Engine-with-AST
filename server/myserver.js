const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Rule = require('../server/api/ruleapi');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/Rule_Engine', {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Database connected successfully.'));

app.use('/rules', Rule);

app.listen(5556, () => console.log('Server running on port 5556.'));
