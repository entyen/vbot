const mongoose = require('mongoose')

const userSchem = new mongoose.Schema({ 
    userid: {type: Number, required: true, unique: true}, 
    f_name: String,
    acclvl: Number,
    balance: Number, 
    tel: Number,
    bl: Number,
    lang: String
})

module.exports = userSchem