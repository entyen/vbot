const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const setting = () => {

}

module.exports = {setting}

