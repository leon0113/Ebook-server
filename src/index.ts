import 'express-async-errors';
import "@/db/connect"
import express from 'express';
import 'dotenv/config'
import authRouter from './routes/auth.router';
import { errorHandler } from "./middlewares/error.middleware";
import cookieParser from 'cookie-parser';
import { fileParser } from './middlewares/file.middleware';
import authorRouter from './routes/author.route';
import bookRouter from './routes/book.route';
import path from 'path';
import formidable from 'formidable';
import reviewRouter from './routes/review.route';
import historyRouter from './routes/history.route';


const app = express();
const port = process.env.PORT || 8000;
const publicPath = path.join(__dirname, './books');

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
// to server book data from nodejs 
app.use('/books', express.static(publicPath))


app.use('/auth', authRouter);
app.use('/author', authorRouter);
app.use('/book', bookRouter);
app.use('/review', reviewRouter);
app.use('/history', historyRouter);


app.use('/test', async (req, res) => {
    const form = formidable({
        uploadDir: path.join(__dirname, './books'),
        filename(name, ext, part, form) {
            return name + '.jpg'
        },
    });
    await form.parse(req)
    res.json({})
});

app.use(errorHandler)

app.listen(port, () => {
    console.log(`App is running on URL: http://localhost:${port}`);
})