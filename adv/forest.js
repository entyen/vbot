const Markup = require('node-vk-bot-api/lib/markup')
const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const forest = {}

forest.main = (ctx) => {
    return ctx.reply('Вы направились в лес', null, keyboard.main)
}

forest.side = (ctx) => {
    return ctx.reply(`Повернув на ${ctx.cmd.split('.')[1] === 'left' ? 'Лево' : 'Право'} вы заметели ${null}`, null, keyboard.side)
}

const keyboard = {}

keyboard.main = Markup.keyboard([
    [
        Markup.button('Повернуть на лево', 'primary', 'adventure.left'),
        Markup.button('Повернуть на право', 'primary', 'adventure.right'),
    ],
    [
        Markup.button(lang.back, 'negative', 'menu'),
    ],
])

keyboard.side = Markup.keyboard([
    [
        Markup.button('Напасть', 'primary', 'adventure.fight'),
        Markup.button('Идти дальше', 'primary', 'adventure.cross'),
    ],
    [
        Markup.button(lang.back, 'negative', 'menu'),
    ],
])




module.exports = { forest }