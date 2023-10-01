const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Você precisa adicionar um nome.'],
    },

    email: {
        type: String,
        required: [true, 'Você precisa adicionar um email.'],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Informe um email válido.',
        ]
    },

    password: {
        type: String,
        required: [true, 'Você precisa adicionar uma senha.'],
        minLength: [8, 'A senha precisa conter 8 ou mais caracteres.'],
       // maxLength: [23, 'A senha precisa ser menor que 23 caracteres.'],
    },

    photo: {
        type: String,
        required: [true, 'Você precisa adicionar uma foto.'],
        default: 'https://i.ibb.co/4pDNDk1/avatar.png',
    },

    phone: {
        type: String,
        default: '+55',
    },

    bio: {
        type: String,
        maxLength: [250, 'A sua biografia precisa ser menor que 250 caracteres.'],
        default: 'bio',
    }
}, {
    timestamps: true,
});

// encrypt password antes de salvar no banco de dados
userSchema.pre('save', async function(next) {

    if(!this.isModified('password')) {
        return next();
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;