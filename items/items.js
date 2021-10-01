const mongoose = require('mongoose')
const { itemSchem } = require('../schema/data.js')
const itemdb = mongoose.model('items', itemSchem)
const idgen = (async () => {
    id = await itemdb.countDocuments()
    return ++id
})()

// console.log(idgen)

const items =  [
    // new itemdb ({
    //     id: idgen,
    //     name: '🗡️ Меч',
    //     desc: 'Меч',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 14,
    //         m_atk: 6,
    //     },
    //     stat: {
    //         str: 3,
    //         int: 1,
    //     },
    // }),
    // new itemdb ({
    //     id: idgen, 
    //     name: '🪄 Жезл',
    //     desc: 'Жезл',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 6,
    //         m_atk: 14,
    //     },
    //     stat: {
    //         str: 1,
    //         int: 3,
    //     },
    // }),
    // new itemdb ({
    //     id: idgen, 
    //     name: '🎣 Удочка',
    //     desc: 'Удочка',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 3,
    //     stat: {
    //         luc: 1,
    //     },
    // }),
    // new itemdb ({
    //     id: idgen, 
    //     name: '⚔️ Дуалы',
    //     desc: 'Дуалы',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 14,
    //         m_atk: 6,
    //     },
    //     stat: {
    //         str: 3,
    //         int: 1,
    //     },
    // }),
    // new itemdb ({
    //     id: idgen, 
    //     name: '🏹️ Лук',
    //     desc: 'Лук',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 14,
    //         m_atk: 6,
    //     },
    //     stat: {
    //         str: 3,
    //         int: 1,
    //     },
    // }),
    // new itemdb ({
    //     id: idgen, 
    //     name: '📜 Свиток Зачарования Инструмента',
    //     desc: 'Свиток Зачарования Инструмента',
    //     img: 'photo671833319_457239065',
    //     weight: 20,
    //     stack: false,
    //     type: -1,
    // }),
]


module.exports = items