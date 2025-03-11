require('dotenv').config();
const express = require('express');
const path = require('path');
const route = require('./routes');

const port = process.env.PORT || 3000;
const app = express();

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
