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
                    Markup.button(lang.alert, alertState),
                    Markup.button(lang.nick, 'default'),
                    Markup.button(lang.back, 'negative'),
                ],
            ])
        )
        await ctx.scene.next()
    },

    async (ctx) => {
        if (ctx.cmd === lang.nick) {
            await ctx.scene.enter('menu', [1])
        } else
        if (ctx.cmd === lang.alert) {
            if (ctx.user.alert) {
                ctx.user.alert = false
                await ctx.user.save()
                await ctx.reply(`${lang.alert} ${ctx.user.alert ? 'Включены' : 'Выключены'}`)
                await ctx.scene.enter('setting')
            } else {
                ctx.user.alert = true
                await ctx.user.save()
                await ctx.reply(`${lang.alert} ${ctx.user.alert ? 'Включены' : 'Выключены'}`)
                await ctx.scene.enter('setting')
            }
        } else if (ctx.cmd === lang.dev || ctx.cmd === lang.adm || ctx.cmd === lang.moder || ctx.cmd === lang.user || ctx.cmd === lang.vip || ctx.cmd === lang.plat) {
            ctx.user.acclvl >= 7 ? ctx.reply(`${lang.userGrpCmd} ${lang.dev} ${lang.rate} ${lang.devCmd}`)
             : ctx.user.acclvl == 6 ? ctx.reply(`${lang.userGrpCmd} ${lang.adm} ${lang.rate}`)
              : ctx.user.acclvl == 5 ? ctx.reply(`${lang.userGrpCmd} ${lang.moder} ${lang.rate}`)
               : ctx.user.acclvl == 2 ? ctx.reply(`${lang.userGrpCmd} ${lang.plat} ${lang.rate}`)
                 : ctx.user.acclvl == 1 ? ctx.reply(`${lang.userGrpCmd} ${lang.vip} ${lang.rate}`)
                  : ctx.user.acclvl == 0 ? ctx.reply(`${lang.userGrpCmd} ${lang.user} ${lang.rate}`)
                   : ctx.reply(lang.noPerm)
        } else if (ctx.cmd === lang.back) {
            await ctx.scene.enter('menu')
        }
    }
)

module.exports = {setting}

