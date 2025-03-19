// Import dependencies
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Import module
import route from './routes';
import { connect as dbConnect } from './config/database';

// Connect to DB
dbConnect();

const port: number = parseInt(process.env.PORT || '3000', 10);
const app: Express = express();

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