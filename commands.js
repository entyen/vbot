module.exports = async(bot, lang, userdb, bp) => {
    const Markup = require('node-vk-bot-api/lib/markup')

    bot.event('message_event', async (ctx) => {
        const cb = []
        cb.reply = async (textO) => {
                bot.execute('messages.sendMessageEventAnswer', {
                    user_id: ctx.message.user_id,
                    peer_id: ctx.message.peer_id,
                    event_id: ctx.message.event_id,
                    event_data: JSON.stringify({
                        type: "show_snackbar",
                        text: textO,
                    }),
                })
        }
        const randCurr = (min, max) => {
            return Math.floor(Math.random() * (max - min) + min)
        }

        const lvl = ctx.user.level
        const lvlx = ctx.user.level <= 0 ? 1 : 1 + (ctx.user.level * 0.2)

        if (ctx.user.currWeight > ctx.user.invWeight) {
            if (ctx.cmd === lang[23]) return ctx.scene.enter('menu')
            return await cb.reply('Инвентарь перегружен разгрузитесь и возвращайтесь')
        }
        if (ctx.cmd === lang[19] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
                await cb.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {
                ctx.user.energy = ctx.user.energy - 1

                let earn = randCurr(5, 18)
                const rare = randCurr(0, 200)
                earn = Math.round(earn * lvlx)

                rare === 27 ? ctx.user.inv.rareHerbs = ctx.user.inv.rareHerbs + 1 : null
                ctx.user.inv.herbs = ctx.user.inv.herbs + earn
                ctx.user.exp = ctx.user.exp + 1
                await ctx.user.save()

                await cb.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 27 ? 'и 1 🍀' : ''} у вас еще ${ctx.user.energy} ⚡`)
            }
        } else
        if (ctx.cmd === lang[21] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
                await cb.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

                ctx.user.energy = ctx.user.energy - 1

                let earn = randCurr(3, 24)
                const rare = randCurr(0, 400)
                earn = Math.round(earn * lvlx)

                rare === 277 ? ctx.user.inv.rareOre = ctx.user.inv.rareOre + 1 : null
                ctx.user.inv.ore = ctx.user.inv.ore + earn
                ctx.user.exp = ctx.user.exp + 1
                await ctx.user.save()

                await cb.reply(`Вы направились в горную шахту и добыли ${earn} ⛰ ${rare === 277 ? 'и 1 💎' : ''} у вас еще ${ctx.user.energy} ⚡`)
            }
        } else
        if (ctx.cmd === lang[22] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
                await cb.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

                ctx.user.energy = ctx.user.energy - 1

                let earn = randCurr(8, 48)
                earn = Math.round(earn * lvlx)

                ctx.user.inv.sand = ctx.user.inv.sand + earn
                ctx.user.exp = ctx.user.exp + 1
                await ctx.user.save()

                await cb.reply(`Вы направились на пляж и откопали ${earn} 🏝 у вас еще ${ctx.user.energy} ⚡`)
            }
        } else
        if (ctx.cmd === lang[24] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
                await cb.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

                ctx.user.energy = ctx.user.energy - 1

                let earn = randCurr(16, 28)
                earn = Math.round(earn * lvlx)

                ctx.user.inv.wood = ctx.user.inv.wood + earn
                ctx.user.exp = ctx.user.exp + 1
                await ctx.user.save()

                await cb.reply(`Вы направились в лес и нарубили ${earn} 🌲 у вас еще ${ctx.user.energy} ⚡`)
            }
        } else
        if (ctx.cmd === lang[25] && lvl >= 0) {
            if (lvl <= 4) return cb.reply(`Протите но рыбалка доступна с 4 уровня.`)
            if (ctx.user.energy <= 0) {
                await cb.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

                // ctx.user.energy = ctx.user.energy - 1

                let earn = randCurr(0, 0)
                earn = Math.round(earn * lvlx)

                // ctx.user.inv.wood = ctx.user.inv.wood+earn
                // ctx.user.exp = ctx.user.exp+1
                // await ctx.user.save()

                await cb.reply(`Вы направились на рыбалку и поймали ${earn} 🐟 у вас еще ${ctx.user.energy} энергии.`)
            } 
        }
    })

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
        if (ctx.cmd === lang[39]) {
            await ctx.scene.enter('menu', [1])
        } else
        if (cmba[0] === 'bup' || cmba[0] === 'alvup') {
            try {
                if (ctx.user.acclvl >= 7 && cmba[0] === 'bup') {
                    const locUser = await userdb.findOne({ uid: cmba[1] })
                    const balup = (locUser.balance + Number(cmba[2]))
                    locUser.balance = balup.toFixed(2)
                    // await locUser.save()
                    await ctx.reply(`@id${locUser.id} user balance up to ${cmba[2] + lang[5]} current balance ${balup + lang[5]}`)
                    await bot.sendMessage(locUser.id, `${lang[14]} ${cmba[2] + lang[5]} ${lang[15]} ${balup + lang[5]}`)
                }
                else if (ctx.user.acclvl >= 7 && cmba[0] === 'alvup') {
                    let locUser = await userdb.findOne({ uid: cmba[1] })
                    console.log(locUser.acclvl)
                    if (locUser.acclvl === 7) { 
                        return ctx.reply(`Нельзя менять уровень у ${lang[11]}a`)
                    } else {
                        locUser.acclvl = Math.round(cmba[2])
                        await locUser.save()
                        await ctx.reply(`@id${locUser.id} account level up to ${cmba[2] == 0 ? lang[26]: cmba[2] == 1 ? lang[27]: cmba[2] == 2 ? lang[28]:
                            cmba[2] == 7 ? lang[11]: cmba[2] == 6 ? lang[10]: cmba[2] == 5 ? lang[9]: cmba[2]}`)
                        await bot.sendMessage(locUser.id, `Теперь уровень вашего Аккаунта ${cmba[2] == 0 ? lang[26]: cmba[2] == 1 ? lang[27]: cmba[2] == 2 ? lang[28]:
                            cmba[2] == 7 ? lang[11]: cmba[2] == 6 ? lang[10]: cmba[2] == 5 ? lang[9]: cmba[2]}`)
                    }
                } else { ctx.reply(lang[7]) }
            } catch (e) {
                ctx.reply(lang[16])
                console.log(e)
            } 
        } else
        if (cmba[0] === 'Рейтинг' || cmba[0] === 'rate') { 
            user = await userdb.find({})
            let rate = [{}]
            let result = `Рейтинг: \n`
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
            if (ctx.message.id === 0) {return}
            await ctx.reply(`${ctx.message.text} ${lang[4]}`)
            await ctx.scene.enter('menu')
        }
    })
}