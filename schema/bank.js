const mongoose = require('mongoose')

const bankSchem = new mongoose.Schema({ 
    id: {type: Number, required: true, unique: true}, 
    uid: {type: Number, required: true, unique: true}, 
    name: String,
    balance: { type: Number, default: 0 },
    inv: {
        herbs: { type: Number, default: 0 },
        rareHerbs: { type: Number, default: 0 },
        sand: { type: Number, default: 0 },
        ore: { type: Number, default: 0 },
        rareOre: { type: Number, default: 0 },
        wood: { type: Number, default: 0 },
        fish: { type: Number, default: 0 },
        rareFish: { type: Number, default: 0 },
    },
    dpi: { 
        herbs: { type: Number, default: 0.0 },
        sand: { type: Number, default: 0.0 },
        ore: { type: Number, default: 0.0 },
        wood: { type: Number, default: 0.0 },
        fish: { type: Number, default: 0.0 },
    }
})

module.exports = bankSchem