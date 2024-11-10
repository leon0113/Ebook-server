import "@/db/connect";
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import formidable from 'formidable';
import path from 'path';
import { errorHandler } from "./middlewares/error.middleware";
import { isAuth } from './middlewares/isAuth.middleware';
import { isValidReadingRequest } from './middlewares/isValidReadingRequest.middleware';
import authRouter from './routes/auth.router';
import authorRouter from './routes/author.route';
import bookRouter from './routes/book.route';
import historyRouter from './routes/history.route';
import reviewRouter from './routes/review.route';
import cartRouter from "./routes/cart.route";
import checkoutRouter from "./routes/checkout.router";
import webhookRouter from "./routes/webhook.router";
import orderRouter from "./routes/order.route";


const app = express();
const port = process.env.PORT || 8000;
const publicPath = path.join(__dirname, './books');

app.use('/webhook', webhookRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// to server book data from nodejs 
app.use('/books', isAuth, isValidReadingRequest, express.static(publicPath));


app.use('/auth', authRouter);
app.use('/author', authorRouter);
app.use('/book', bookRouter);
app.use('/review', reviewRouter);
app.use('/history', historyRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/order', orderRouter);


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

app.use(errorHandler);

app.listen(port, () => {
    console.log(`App is running on URL: http://localhost:${port}`);
});