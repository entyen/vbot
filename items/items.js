const mongoose = require('mongoose')
const { itemSchem } = require('../schema/data.js')
const itemdb = mongoose.model('items', itemSchem)

const items =  [
    new itemdb ({
        id: 1,
        name: '🗡️ Меч',
        desc: 'Стартовый Меч',
        img: 'photo671833319_457239065',
        weight: 20,
        char: {
            hp: 0,
            mp: 0,
            f_atk: 14,
            m_atk: 6,
            f_def: 0,
            m_def: 0,
        },
        stat: {
            str: 3,
            int: 1,
            con: 0,
            luc: 0,
            chr: 0,
        },
    }),
    new itemdb ({
        id: 2, 
        name: 'Жезл',
        desc: 'Стартовый Жезл',
        img: 'photo671833319_457239065',
        weight: 20,
        char: {
            hp: 0,
            mp: 0,
            f_atk: 6,
            m_atk: 14,
            f_def: 0,
            m_def: 0,
        },
        stat: {
            str: 1,
            int: 3,
            con: 0,
            luc: 0,
            chr: 0,
        },
    }),
    new itemdb ({
        id: 3, 
        name: '🎣 Удочка',
        desc: 'Test Item',
        img: 'photo671833319_457239065',
        weight: 20,
        char: {
            hp: 0,
            mp: 0,
            f_atk: 14,
            m_atk: 6,
            f_def: 0,
            m_def: 0,
        },
        stat: {
            str: 3,
            int: 1,
            con: 0,
            luc: 0,
            chr: 0,
        },
    })
]


module.exports = items