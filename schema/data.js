const mongoose = require('mongoose')
const date = new Date(new Date().toLocaleString('en-US', {timeZone: 'Etc/GMT-6'}))
const timestamp = new Date().getTime()

const userSchem = new mongoose.Schema({ 
    id: {type: Number, required: true, unique: true}, 
    uid: {type: Number, required: true, unique: true}, 
    regDate: { type: Date, default: date },
    f_name: String,
    acclvl: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    lang: { type: String, default: 'ru' },
    timers: {
        mainWork: { type: Number, default: null },
        hasWorked: { type: Boolean, default: false },
        bonus: { type: Boolean, default: false },
        eFullAlert: { type: Boolean, default: true },
        buffNewByAlert: { type: Boolean, default: false },
        buffVipAlert: { type: Boolean, default: true },
        buffBanAlert: { type: Boolean, default: true },
        buffRate1St: { type: Boolean, default: true },
        buffRate2St: { type: Boolean, default: true },
        buffRate3St: { type: Boolean, default: true },
        buffRate9St: { type: Boolean, default: true },
    },
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
    items: {
        fishingRod: { type: Boolean, default: false },
        bait: { type: Number, default: 0 },
        energyPotion: { type: Number, default: 0 },
    },
    boosters: {
        energyCount: { type: Number, default: 1 },
        energyRegen: { type: Number, default: 1 },
        harvest: { type: Number, default: 1 },
    },
    buffs: {
        newby: { type: Number, default: +timestamp + (10080*60*1000) },
        vip: { type: Number, default: null },
        ban: { type: Number, default: null },
        rate1st: { type: Number, default: null },
        rate2st: { type: Number, default: null },
        rate3st: { type: Number, default: null },
        rate9st: { type: Number, default: null },
    },
    plot: {
        own: { type: Boolean, default: false },
        size: { type: Number, default: 0 },
        house: { type: Number, default: 0 },
        wh: { type: Number, default: 0 },
        temple: { type: Number, default: 0 },
        mc: { type: Number, default: 0 },
        well: { type: Number, default: 0 },
    },
    invWeight: { type: Number, default: 50000 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    race: { type: Number, default: 0 },
    alert: { type: Boolean, default: true },
})

module.exports = userSchem