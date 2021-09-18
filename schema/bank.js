const mongoose = require('mongoose')

const bankSchem = new mongoose.Schema({ 
    id: {type: Number, required: true, unique: true}, 
    uid: {type: Number, required: true, unique: true}, 
    name: String,
    balance: { type: Number, default: 0 },
    inv: {
        vinmt: { type: Number, default: 0 },
        herbs: { type: Number, default: 0 },
        rareHerbs: { type: Number, default: 0 },
        sand: { type: Number, default: 0 },
        rareSand: { type: Number, default: 0 },
        ore: { type: Number, default: 0 },
        rareOre: { type: Number, default: 0 },
        wood: { type: Number, default: 0 },
        rareWood: { type: Number, default: 0 },
        fish: { type: Number, default: 0 },
        rareFish: { type: Number, default: 0 },
    },
    dpi: { 
        vinmt: { type: Number, default: 0 },
        herbs: { type: Number, default: 0 },
        sand: { type: Number, default: 0 },
        ore: { type: Number, default: 0 },
        wood: { type: Number, default: 0 },
        fish: { type: Number, default: 0 },
        rareHerbs: { type: Number, default: 0 },
        rareSand: { type: Number, default: 0 },
        rareOre: { type: Number, default: 0 },
        rareWood: { type: Number, default: 0 },
        rareFish: { type: Number, default: 0 },
    }
})

module.exports = bankSchem