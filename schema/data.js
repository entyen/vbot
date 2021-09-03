const mongoose = require('mongoose')

const userSchem = new mongoose.Schema({ 
    id: {type: Number, required: true, unique: true}, 
    uid: {type: Number, required: true, unique: true}, 
    regDate: Date,
    f_name: String,
    acclvl: Number,
    balance: Number, 
    lang: String,
    timers: {
        mainWork: Number,
        hasWorked: Boolean,
        bonus: Boolean
    },
    inv: {
        herbs: Number,
        rareHerbs: Number,
    },
    exp: Number,
    level: Number,
    energy: Number,
    race: Number,
    alert: Boolean
})

module.exports = userSchem