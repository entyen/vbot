module.exports = async(bot, lang, userdb, bp) => {
    const Markup = require('node-vk-bot-api/lib/markup')

    bot.on(async (ctx) => {
        const cmba = ctx.message.text.split(' ')

        if (ctx.cmd === ctx.user.f_name) {
            let text = ``
            text += `🔎 UID: ${ctx.user.uid}\n`
            text += ` 👤 Статус Аккаунта: ${ctx.user._acclvl}\n`
            text += `🌟 Уровень: ${ctx.user.level} [${ctx.user.exp}/${100*(ctx.user.level+1)}]\n`
            text += `🧤 Расса: ${ctx.user.race === 0 && 'Без Рассы'}\n`
            text += `⚡ Очки Энергии: ${ctx.user.energy}\n`
            text += `🔔 Уведомления: ${ctx.user.alert ? 'Включены' : 'Выключены'}\n`
            text += `\n📗 Дата регистрации: ${ctx.user.regDate}`

            await ctx.reply(`Профиль\n ${text}`)
        } else
        if (ctx.cmd === `${ctx.user.balance} ${lang[5]}`) {
            let inv = ``
            inv += `💠 Баланс: ${ctx.user.balance}\n`
            inv += `${lang[33]}: ${ctx.user.inv.herbs}\n`
            inv += `${lang[34]}: ${ctx.user.inv.ore}\n`
            inv += `${lang[35]}: ${ctx.user.inv.sand}\n`
            inv += `${lang[36]}: ${ctx.user.inv.wood}\n`
            inv += `${ctx.user.inv.rareHerbs === 0 ? '' : `🍀 Редкие Травы: ${ctx.user.inv.rareHerbs}\n`}`
            inv += `${ctx.user.inv.rareOre === 0 ? '' : `💎 Редкая Руда: ${ctx.user.inv.rareOre}\n`}`
            inv += `\n👜 Вес Инвентаря: ${ctx.user.currWeight}/${ctx.user.invWeight}\n`

            await ctx.reply(`Инвентарь\n ${inv}`)
        } else
        if (ctx.cmd === lang[2]) {
            await ctx.scene.enter('menu')
        } else
        if (ctx.cmd === lang[3]) {
            await ctx.scene.enter('setting')
        } else
        if (ctx.cmd === lang[8]) { 
            await ctx.scene.enter('job')
        } else
        if (ctx.cmd === lang[32]) { 
            await ctx.scene.enter('market')
        } else
        if (ctx.cmd === lang[29]) { 
            await ctx.reply(lang[31])
        } else
        if (cmba[0] === 'bup' || cmba[0] === 'alvup') {
            try {
                if (ctx.user.acclvl >= 7 && cmba[0] === 'bup') {
                    const locUser = await userdb.findOne({ id: cmba[1] })
                    const balup = (locUser.balance + Number(cmba[2]))
                    locUser.balance = balup.toFixed(2)
                    // await locUser.save()
                    await ctx.reply(`@id${cmba[1]} user balance up to ${cmba[2] + lang[5]} current balance ${balup + lang[5]}`)
                    await bot.sendMessage(cmba[1], `${lang[14]} ${cmba[2] + lang[5]} ${lang[15]} ${balup + lang[5]}`)
                }
                else if (ctx.user.acclvl >= 7 && cmba[0] === 'alvup') {
                    let locUser = await userdb.findOne({ id: cmba[1] })
                    console.log(locUser.acclvl)
                    if (locUser.acclvl === 7) { 
                        return ctx.reply(`Нельзя менять уровень у ${lang[11]}a`)
                    } else {
                        locUser.acclvl = Math.round(cmba[2])
                        await locUser.save()
                        await ctx.reply(`@id${cmba[1]} account level up to ${cmba[2] == 0 ? lang[26]: cmba[2] == 1 ? lang[27]: cmba[2] == 2 ? lang[28]:
                            cmba[2] == 7 ? lang[11]: cmba[2] == 6 ? lang[10]: cmba[2] == 5 ? lang[9]: cmba[2]}`)
                        await bot.sendMessage(cmba[1], `Теперь уровень вашего Аккаунта ${cmba[2] == 0 ? lang[26]: cmba[2] == 1 ? lang[27]: cmba[2] == 2 ? lang[28]:
                            cmba[2] == 7 ? lang[11]: cmba[2] == 6 ? lang[10]: cmba[2] == 5 ? lang[9]: cmba[2]}`)
                    }
                } else { ctx.reply(lang[7]) }
            } catch (e) {
                ctx.reply(lang[16])
                console.log(e)
            } 
        } else
        if (cmba[0] === 'rate') { 
            user = await userdb.find({})
            let rate = [{}]
            let result = `Rate: \n`
            for (i = 0; i < user.length; i++) { 
                if (user[i].balance > 0) {
                        rate[i] = {vid: user[i].id, n: user[i].f_name, b: user[i].balance}
                }
            }
            rate.sort((a,b) => {return b.b - a.b })
            for (i = 0; i < 9; i++) {
                if(rate[i] !== undefined) {
                    result += `${i === 0 ? '🥇': i === 1 ? '🥈': i === 2 ? '🥉' : '🏅'} @id${rate[i].vid}(${rate[i].n}) = ${rate[i].b} ${lang[5]}\n`
                }
            }
            ctx.reply(result)
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