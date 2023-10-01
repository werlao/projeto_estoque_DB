const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies.token;

        if(!token) {
            res.status(401);
            throw new Error('Não autorizado, você precisa estar logado.');
        }

        // verificar token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // pegar id do usuário pelo token
        const user = await User.findById(verified.id).select('-password');

        if(!user) {
            res.status(401);
            throw new Error('Usuário não encontrado.');
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401);
        throw new Error('Não autorizado, você precisa estar logado.');
    }
});

module.exports = protect;