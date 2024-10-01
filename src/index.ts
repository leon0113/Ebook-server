import express from 'express';

const app = express();
const port = process.env.PORT || 8000;


app.get('/', (req, res) => {
    res.send('Successful')
})

app.listen(port, () => {
    console.log(`App is running on port: ${port}`);
})