const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))


const menu = new Scene('menu',
    async (ctx) => {
        if (ctx.user.acclvl >= 5) {
            await ctx.reply(lang[1], null, Markup
                .keyboard([
                    [
                        Markup.button(lang[8], 'primary'),
                        Markup.button(lang[32], 'primary'),
                    ],
                    [
                        Markup.button(ctx.user.f_name, 'secondary'),
                        Markup.button(lang[3], 'positive'),
                        Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                    ],
                    [
                        Markup.button(`${lang[29]}`, 'secondary'),
                    ],
                ])
            )
        } else {
            await ctx.reply(lang[1], null, Markup
                .keyboard([
                    [
                        Markup.button(lang[8], 'primary'),
                        Markup.button(lang[32], 'primary'),
                    ],
                    [
                        Markup.button(ctx.user.f_name, 'secondary'),
                        Markup.button(lang[3], 'positive'),
                        Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                    ],
                    [
                        Markup.button(`${lang[29]}`, 'secondary'),
                    ],
                ])
            )
        }
        await ctx.scene.leave()
    },

    async (ctx) => {

        await ctx.scene.leave()
        await ctx.reply(`${lang[6]} ${ctx.message.text}`)
        await ctx.scene.enter('menu', [0])
    },
)

module.exports = {menu}
