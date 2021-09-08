const mongoose = require('mongoose')

const bankSchem = new mongoose.Schema({ 
    id: {type: Number, required: true, unique: true}, 
    uid: {type: Number, required: true, unique: true}, 
    name: String,
    balance: Number, 
    inv: {
        herbs: Number,
        rareHerbs: Number,
        sand: Number,
        ore: Number,
        rareOre: Number,
        wood: Number,
    },
    dpi: { 
        herbs: Number,
        sand: Number,
        ore: Number,
        wood: Number,
    }
})

module.exports = bankSchem