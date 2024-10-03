import 'express-async-errors';
import "@/db/connect"
import express from 'express';
import 'dotenv/config'
import authRouter from './routes/auth.router';
import { errorHandler } from "./middlewares/error.middleware";


const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }))


app.use('/auth', authRouter);

app.use(errorHandler)

app.listen(port, () => {
    console.log(`App is running on URL: http://localhost:${port}`);
})