const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const errorHandler = require('./middleWare/errorMiddleWare');
const cookieParser = require('cookie-parser');

const app = express();

const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

// routes middleware
app.use('/api/users', userRoute);

// routes
app.get('/', (req, res) => {

    res.send('Página inicial');
});
// error middleware
app.use(errorHandler);

// connect to DB and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`server iniciado na porta ${PORT}`);
        });
    })
    .catch((err) => console.log(err));