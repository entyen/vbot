const mongoose = require('mongoose')
const { itemSchem } = require('../schema/data.js')
const itemdb = mongoose.model('items', itemSchem)

const items =  [
    // new itemdb ({
    //     id: 1,
    //     name: '🗡️ Меч',
    //     desc: 'Меч',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 14,
    //         m_atk: 6,
    //         acc: 17,
    //     },
    // }),
    // new itemdb ({
    //     id: 2, 
    //     name: '🪄 Жезл',
    //     desc: 'Жезл',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 6,
    //         m_atk: 14,
    //         acc: 20,
    //     },
    // }),
    // new itemdb ({
    //     id: 3, 
    //     name: '🎣 Удочка',
    //     desc: 'Удочка',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 3,
    //     stat: {
    //         luc: 1
    //     },
    // }),
    // new itemdb ({
    //     id: 4, 
    //     name: '⚔️ Дуалы',
    //     desc: 'Дуалы',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 20,
    //         m_atk: 6,
    //         acc: 10,
    //     },
    // }),
    // new itemdb ({
    //     id: 5, 
    //     name: '🏹️ Лук',
    //     desc: 'Лук',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 30,
    //         m_atk: 10,
    //         acc: 6,
    //     },
    // }),
    // new itemdb ({
    //     id: 6, 
    //     name: '📜 Свиток Зачарования',
    //     desc: 'Свиток Зачарования',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: true,
    //     type: -1,
    // }),
]


module.exports = items