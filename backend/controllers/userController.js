const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1d'});
};


// REGISTRAR USUÁRIO
const registerUser = asyncHandler( async (req, res) => {

    const {name, email, password} = req.body;

    // validação
    if(! name || !email || !password) {
        res.status(400);
        throw new Error('Você precisa preencher todos os campos.');
    }

    if(password.length < 6) {
        res.status(400);
        throw new Error('A senha precisa conter 8 ou mais caracteres.');
    }

    // checar se o email já existe
    const userExists = await User.findOne({email});

    if(userExists){
        res.status(400);
        throw new Error('Este email já está em uso.');
    }

    // criar um novo usuário
    const user = await User.create({
        name,
        email,
        password,
    });

    // gerar token
    const token = generateToken(user._id);

    // enviar http-only cookie
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 dia
        sameSite: 'none',
        secure: true
    });

    if(user) {
        const {_id, name, email, photo, phone, bio} = user;

        res.status(201).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error('Dados de usuário incorretos.');
    }
});


// LOGAR USUÁRIO
const loginUser = asyncHandler( async (req, res) => {
    
    const {email, password} = req.body;

    // validar o request
    if(!email || !password) {
        res.status(400);
        throw new Error('Você precisa preencher todos os campos.');
    }

    // checar se o usuario existe
    const user = await User.findOne({email});

    if(!user) {
        res.status(400);
        throw new Error('Dados de usuário não encontrados, você precisa se registrar.');
    }

    // se o usuário existir, checar se a senha está correta
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    // gerar token
    const token = generateToken(user._id);

    // enviar http-only cookie
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 dia
        sameSite: 'none',
        secure: true
    });

    if(user && passwordIsCorrect) {

        const {_id, name, email, photo, phone, bio} = user;

        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error('Email ou senha inválidos.');
    }
});


// DESLOGAR USUÁRIO
const logout = asyncHandler( async (req, res) => {

    res.cookie('token', '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'none',
        secure: true
    });
    return res.status(200).json({ message: 'Deslogado com sucesso.' });
});


// EDITAR DADOS DO USUÁRIO
const getUser = asyncHandler(async(req, res) => {

    const user = await User.findById(req.user._id);

    if(user) {
        const {_id, name, email, photo, phone, bio} = user;

        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
        });
    } else {
        res.status(400);
        throw new Error('Usuário não encontrado.');
    }
});


// PEGAR STATUS DO LOGIN
const loginStatus = asyncHandler(async(req, res) => {

    const token = req.cookies.token;

    if(!token) {
        return res.json(false);
    }
    
    // verificar token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if(verified) {
        return res.json(true);
    }
    return res.json(false);
    
});


// ATUALIZAR USUÁRIO
const updateUser = asyncHandler( async(req, res) => {
    const user = await User.findById(req.user._id);

    if(user) {
        const {name, email, photo, phone, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        });
    } else {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }
});


// ATUALIZAR SENHA DO USUÁRIO
const changePassword = asyncHandler( async(req, res) => {
    const user = await User.findById(req.user._id);
    const {oldPassword, password} = req.body;

    if(!user) {
        res.status(400);
        throw new Error('Usuário não encontrado.');
    }

    // validar
    if(!oldPassword || !password) {
        res.status(400);
        throw new Error('Preencha a antiga e nova senha.');
    }

    // checar se a senha antiga está correta no DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    // salvar a nova senha
    if (user && passwordIsCorrect) {
        user.password = password;
        await user.save();
        res.status(200).send('Senha alterada com sucesso.');
    } else {
        res.status(400);
        throw new Error('Senha antiga incorreta.');
    }

});

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword
};