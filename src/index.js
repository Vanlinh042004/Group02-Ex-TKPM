require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const route = require('./routes');

const db = require('./config/database');
// Connect to DB
db.connect();

const port = process.env.PORT || 3000;
const app = express();

// Sử dụng CORS cho tất cả các route
app.use(cors());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

// route init
route(app);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
