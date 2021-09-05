const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const randCurr = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
}

const job = new Scene('job',
    async (ctx) => {
        ctx.reply(`Выбирете направление вашего дальнейшего пути! У вас ${ctx.user.energy}⚡`, null, Markup
            .keyboard([
                [
                    Markup.button({ action: { type: 'callback', label: lang[19], payload: JSON.stringify({cmd: lang[19]})},color: 'primary',}),
                    Markup.button({ action: { type: 'callback', label: lang[21], payload: JSON.stringify({cmd: lang[21]})},color: 'primary',}),
                ],
                [
                    Markup.button({ action: { type: 'callback', label: lang[22], payload: JSON.stringify({cmd: lang[22]})},color: 'primary',}),
                    Markup.button({ action: { type: 'callback', label: lang[24], payload: JSON.stringify({cmd: lang[24]})},color: 'primary',}),
                ],
                [
                    Markup.button({ action: { type: 'callback', label: lang[25], payload: JSON.stringify({cmd: lang[25]})},color: 'primary',}),
                    Markup.button(lang[23], 'negative'),
                ]
            ])
        )

        await ctx.scene.next()
    },

    async (ctx) => {
        const lvl = ctx.user.level
        const lvlx = ctx.user.level <= 0 ? 1 : 1 + (ctx.user.level * 0.2)

        if (ctx.user.currWeight > ctx.user.invWeight) {
            if (ctx.cmd === lang[23]) return ctx.scene.enter('menu')
            return await ctx.reply('Инвентарь перегружен разгрузитесь и возвращайтесь')
        }
        if (ctx.cmd === lang[19] && lvl >= 0) {
            // const coldown = Math.ceil((ctx.user.timers.mainWork - ctx.timestamp)/60/1000)
            // if (coldown >= 1) {
            //    await ctx.reply(`Вы устали, ⏳ отдохните ${coldown} минут и возвращайтесь.`)
            //    await ctx.scene.leave()
            //    await ctx.scene.enter('menu', [0])
            // } else {

            if (ctx.user.energy <= 0) {
                await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

                // if (ctx.user.alert) {
                //   bp.delay(10*60*1000).then( () => ctx.reply('Работа снова доступна') )
                // }

                // ctx.user.timers.mainWork = ctx.timestamp + 10 * 60 * 1000
                ctx.user.energy = ctx.user.energy - 1

                let earn = randCurr(5, 18)
                const rare = randCurr(0, 200)
                earn = Math.round(earn * lvlx)

                rare === 27 ? ctx.user.inv.rareHerbs = ctx.user.inv.rareHerbs + 1 : null
                ctx.user.inv.herbs = ctx.user.inv.herbs + earn
                ctx.user.exp = ctx.user.exp + 1
                await ctx.user.save()

                await ctx.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 27 ? 'и 1 🍀' : ''} у вас еще ${ctx.user.energy} ⚡`)
            }
        } else {
            await ctx.scene.leave()
            await ctx.scene.enter('menu')
        }
    },
)

module.exports = {job}
