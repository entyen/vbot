module.exports = async(bot, lang, userdb, bp) => {
    const Markup = require('node-vk-bot-api/lib/markup')

    bot.on(async (ctx) => {
        const cmba = ctx.message.text.split(' ')
        const pcmb = ctx.message.payload ? ctx.message.payload.replace(/["{}:]/g, '').replace('button', '') : ctx.message.payload
        const weightMath = async () => {
            let wi = JSON.stringify(ctx.user.inv).replace(/["{}:]/g,'').replace(/[a-zA-Z]/g, '').split(',')
            let sum = 0
            wi.forEach(x => sum += (+x))
            return sum
        }

        if (pcmb === ctx.user.f_name) {
            let text = ``
            text += `🔎 UID: ${ctx.user.uid}\n`
            text += ` 👤 Статус Аккаунта: ${ctx.user.acclvl === 0 && 'Пользователь'}\n`
            text += `🌟 Уровень: ${ctx.user.level} [${ctx.user.exp}/${100*(ctx.user.level+1)}]\n`
            text += `🧤 Расса: ${ctx.user.race === 0 && 'Без Рассы'}\n`
            text += `⚡ Очки Энергии: ${ctx.user.energy}\n`
            text += `🔔 Уведомления: ${ctx.user.alert ? 'Включены' : 'Выключены'}\n`
            text += `\n📗 Дата регистрации: ${ctx.user.regDate}`

            await ctx.reply(`Профиль\n ${text}`)
        } else
        if (pcmb === `${ctx.user.balance} ${lang[5]}`) {
            let inv = ``
            inv += `💠 Баланс: ${ctx.user.balance}\n`
            inv += `🌿 Травы: ${ctx.user.inv.herbs}\n`
            inv += `⛰ Руда: ${ctx.user.inv.ore}\n`
            inv += `🏝 Песок: ${ctx.user.inv.sand}\n`
            inv += `🌲 Древесина: ${ctx.user.inv.wood}\n`
            inv += `${ ctx.user.inv.rareHerbs === 0 ? '' : `🍀 Редкие Травы: ${ctx.user.inv.rareHerbs}\n`}`
            inv += `${ ctx.user.inv.rareOre === 0 ? '' : `💎 Редкая Руда: ${ctx.user.inv.rareOre}\n`}`
            inv += `\n👜 Вес Инвентаря: ${await weightMath()}/${ctx.user.invWeight}\n`

            await ctx.reply(`Инвентарь\n ${inv}`)
        } else
        if (pcmb === lang[2] || pcmb === lang[3]) {
            await ctx.scene.enter('menu')
        } else
        if (pcmb === lang[0]) {
            await ctx.scene.enter('menu', [1])
        } else
        if (pcmb === lang[8]) { 
            await ctx.scene.enter('job')
        } else
        if (pcmb === lang[11] || pcmb === lang[10] || pcmb === lang[9] || pcmb === lang[26] || pcmb === lang[27] || pcmb === lang[28]) {
            ctx.user.acclvl >= 7 ? ctx.reply(`${lang[17]} ${lang[11]} ${lang[18]}`)
            : ctx.user.acclvl == 6 ? ctx.reply(`${lang[17]} ${lang[10]}`)
            : ctx.user.acclvl == 5 ? ctx.reply(`${lang[17]} ${lang[9]}`)
            : ctx.user.acclvl == 2 ? ctx.reply(`${lang[17]} ${lang[28]}`)
            : ctx.user.acclvl == 1 ? ctx.reply(`${lang[17]} ${lang[27]}`)
            : ctx.user.acclvl == 0 ? ctx.reply(`${lang[17]} ${lang[26]}`)
            : ctx.reply(lang[7])
        } else
        if (cmba[0] === 'bup' || cmba[0] === 'alvup') {
            try {
                if (ctx.user.acclvl >= 7 && umes[0] === 'bup') {
                    const locUser = await userdb.findOne({ id: umes[1] })
                    const balup = (locUser.balance + Number(umes[2]))
                    locUser.balance = balup.toFixed(2)
                    await ctx.user.save()
                    await ctx.reply(`@id${umes[1]} user balance up to ${umes[2] + lang[5]} current balance ${balup + lang[5]}`)
                    await bot.sendMessage(umes[1], `${lang[14]} ${umes[2] + lang[5]} ${lang[15]} ${balup + lang[5]}`)
                }
                else if (ctx.user.acclvl >= 7 && umes[0] === 'alvup') {
                    let locUser = await userdb.findOne({ id: umes[1] })
                    if (locUser.acclvl === 7) { 
                        return ctx.reply(`Нельзя менять уровень у ${lang[11]}a`)
                    }
                    locUser.acclvl = Math.round(umes[2])
                    await ctx.user.save()
                    await ctx.reply(`@id${umes[1]} account level up to ${umes[2]}`)
                    await bot.sendMessage(umes[1], `Теперь уровень вашего Аккаунта ${umes[2]}`)
                } else { ctx.reply(lang[7]) }
            } catch (e) {
                ctx.reply(lang[16])
            } 
        } else
        if (cmba[0] === 'lang' && cmba[1] === 'ru' || cmba[1] === 'en') {
            ctx.user.lang = cmba[1]
            await ctx.user.save()
            await ctx.reply(`Язык изменен на ${cmba[1]}`)
        } else 
        if (!ctx.user) {
            await ctx.reply(`${ctx.mesage.text} ${lang[4]}`, null, Markup
                .keyboard([
                    [
                      Markup.button(lang[2], 'primary'),
                    ],
                ])
            )
        } else {
            if (ctx.message.id === 0) {} else {
            await ctx.reply(`${ctx.message.text} ${lang[4]}`)
            await ctx.scene.enter('menu')
            }
        }
    })
}