import "@/db/connect";
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
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
import cors from 'cors';
import searchRouter from "./routes/search.router";


const app = express();
const port = process.env.PORT || 8000;
const publicPath = path.join('/tmp', 'books');

app.use('/webhook', webhookRouter);
app.use(cors({
    origin: ["http://localhost:5173", "https://ebook-client-ten.vercel.app", "https://www.tahjib.online"],
    credentials: true,
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "https://www.tahjib.online");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    console.log("CORS Headers Set for:", req.headers.origin); // Debug log
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(morgan('dev'))
// to server book data from nodejs 
// app.use('/tmp/books', express.static(publicPath));


app.use('/auth', authRouter);
app.use('/author', authorRouter);
app.use('/book', bookRouter);
app.use('/review', reviewRouter);
app.use('/history', historyRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/order', orderRouter);
app.use('/search', searchRouter);


app.use('/test', async (req, res) => {
    res.status(200).json("Running successfully")
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`App is running on URL: http://localhost:${port}`);
});