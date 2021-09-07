const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const setting = new Scene('setting',
    async (ctx) => {
        const alertState = ctx.user.alert ? 'positive' : 'negative'
        const acclvl = ctx.user.acclvl > 5 ? 'negative' : ctx.user.acclvl > 0 ? 'primary' : 'secondary'
        await ctx.reply('Настройки', null, Markup
            .keyboard([
                [
                    Markup.button(`${ctx.user._acclvl}`, acclvl),
                ],
                [
                    Markup.button(lang[30], alertState),
                    Markup.button(lang[39], 'default'),
                    Markup.button(lang[23], 'negative'),
                ],
            ])
        )
        await ctx.scene.next()
    },

    async (ctx) => {
        if (ctx.cmd === lang[39]) {
            await ctx.scene.enter('menu', [1])
        } else
        if (ctx.cmd === lang[30]) {
            if (ctx.user.alert) {
                ctx.user.alert = false
                await ctx.user.save()
                await ctx.reply(`${lang[30]} ${ctx.user.alert ? 'Включены' : 'Выключены'}`)
                await ctx.scene.leave()
                await ctx.scene.enter('setting')
            } else {
                ctx.user.alert = true
                await ctx.user.save()
                await ctx.reply(`${lang[30]} ${ctx.user.alert ? 'Включены' : 'Выключены'}`)
                await ctx.scene.leave()
                await ctx.scene.enter('setting')
            }
        } else if (ctx.cmd === lang[11] || ctx.cmd === lang[10] || ctx.cmd === lang[9] || ctx.cmd === lang[26] || ctx.cmd === lang[27] || ctx.cmd === lang[28]) {
            ctx.user.acclvl >= 7 ? ctx.reply(`${lang[17]} ${lang[11]} ${lang[37]} ${lang[18]}`)
             : ctx.user.acclvl == 6 ? ctx.reply(`${lang[17]} ${lang[10]} ${lang[37]}`)
              : ctx.user.acclvl == 5 ? ctx.reply(`${lang[17]} ${lang[9]} ${lang[37]}`)
               : ctx.user.acclvl == 2 ? ctx.reply(`${lang[17]} ${lang[28]} ${lang[37]}`)
                 : ctx.user.acclvl == 1 ? ctx.reply(`${lang[17]} ${lang[27]} ${lang[37]}`)
                  : ctx.user.acclvl == 0 ? ctx.reply(`${lang[17]} ${lang[26]} ${lang[37]}`)
                   : ctx.reply(lang[7])
        } else if (ctx.cmd === lang[23]) {
            await ctx.scene.leave()
            await ctx.scene.enter('menu')
        }
    }
)

module.exports = {setting}

