const { timeout } = require('cron')

const { Job } = require('./scenes/job')

module.exports = async(bot, lang, userdb, bp) => {
    const Markup = require('node-vk-bot-api/lib/markup')

    bot.command([lang.start,'Начать','Меню','menu'], async (ctx) => {
        if (ctx.user.acclvl >= 4) {
            return await ctx.reply(lang.navm, null, Markup
                .keyboard([
                    [
                        Markup.button(lang.crafts, 'primary'),
                        Markup.button(lang.market, 'primary'),
                    ],
                    [
                        Markup.button(ctx.user.f_name, 'secondary'),
                        Markup.button(lang.setting, 'positive'),
                        Markup.button(`${ctx.user.balance} ${lang.curr}`, 'secondary'),
                    ],
                    [
                        Markup.button(`${lang.land}`, 'secondary'),
                        Markup.button(`Кнопка`, 'secondary'),
                    ],
                ])
            )
        } else 
            return await ctx.reply(lang.navm, null, Markup
                .keyboard([
                    [
                        Markup.button(lang.crafts, 'primary'),
                        Markup.button(lang.market, 'primary'),
                    ],
                    [
                        Markup.button(ctx.user.f_name, 'secondary'),
                        Markup.button(lang.setting, 'positive'),
                        Markup.button(`${ctx.user.balance} ${lang.curr}`, 'secondary'),
                    ],
                    [
                        Markup.button(`${lang.land}`, 'secondary'),
                    ],
                ])
            )
        
    })

    bot.event('message_event', async (ctx) => {
        const job = new Job()
        await job.workhard(bot, ctx)
    })

    bot.on(async (ctx) => {
        const cmba = ctx.message.text.split(' ')

        const marketSell = async (count, item, eachPrice) => {
            count === 'all' ? count = +ctx.user.inv[item] : count = +ctx.cmd.split('.')[2]
            item = ctx.cmd.split('.')[0]
            if (ctx.user.inv[item] < count || count === 0) {
                await ctx.reply(`Недостаточно ${lang[item]}`)
            } else {
                let summ = 0
                eachPrice ? summ = count * eachPrice : summ = count
                summ = Math.round(summ)
                await ctx.bank.inc('inv', count , item)
                await ctx.bank.dec('balance', summ)
                await ctx.user.dec('inv', count , item)
                await ctx.user.inc('balance', summ)
                await ctx.reply(`Вы продали ${count} ${lang[item]} и выручили ${summ} ${lang.curr}`)
            }
        }

        if (cmba[0] === 'bup' || cmba[0] === 'alvup') {
            try {
                if (ctx.user.acclvl >= 7 && cmba[0] === 'bup') {
                    const locUser = await userdb.findOne({ uid: cmba[1] })
                    const balup = (locUser.balance + Number(cmba[2]))
                    locUser.balance = balup.toFixed(2)
                    // await locUser.save()
                    await ctx.reply(`@id${locUser.id} user balance up to ${cmba[2] + lang.curr} current balance ${balup + lang.curr}`)
                    await bot.sendMessage(locUser.id, `${lang.balUp} ${cmba[2] + lang.curr} ${lang.currBal} ${balup + lang.curr}`)
                }
                else if (ctx.user.acclvl >= 7 && cmba[0] === 'alvup') {
                    let locUser = await userdb.findOne({ uid: cmba[1] })
                    console.log(locUser.acclvl)
                    if (locUser.acclvl === 7) {
                        return ctx.reply(`Нельзя менять уровень у ${lang.dev}a`)
                    } else {
                        locUser.acclvl = Math.round(cmba[2])
                        await locUser.save()
                        await ctx.reply(`@id${locUser.id} account level up to ${cmba[2] == 0 ? lang.user: cmba[2] == 1 ? lang.vip: cmba[2] == 2 ? lang.plat:
                            cmba[2] == 7 ? lang.dev: cmba[2] == 6 ? lang.adm: cmba[2] == 5 ? lang.moder: cmba[2]}`)
                        await bot.sendMessage(locUser.id, `Теперь уровень вашего Аккаунта ${cmba[2] == 0 ? lang.user: cmba[2] == 1 ? lang.vip: cmba[2] == 2 ? lang.plat:
                            cmba[2] == 7 ? lang.dev: cmba[2] == 6 ? lang.adm: cmba[2] == 5 ? lang.moder: cmba[2]}`)
                    }
                } else { ctx.reply(lang.noPerm) }
            } catch (e) {
                ctx.reply(lang.errorinput)
                console.log(e)
            }
        } else
        if (cmba[0] === 'Рейтинг' || cmba[0] === 'rate' || cmba[0] === 'top') {
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
                    result += `${i === 0 ? '🥇': i === 1 ? '🥈': i === 2 ? '🥉' : '🏅'} @id${rate[i].vid}(${rate[i].n}) = ${rate[i].b} ${lang.curr}\n`
                }
            }
            ctx.reply(result)
        } else
        if (cmba[0] === 'report') {
                return await bot.sendMessage(671833319, `Test`, null, null, null, null, null, 1207)
        } else
        if (cmba[0] === 'lang' && cmba[1] === 'ru' || cmba[1] === 'en') {
            ctx.user.lang = cmba[1]
            await ctx.user.save()
            await ctx.reply(`Язык изменен на ${cmba[1]}`)
        } else
        if (!ctx.user) {
            await ctx.reply(`${ctx.mesage.text} ${lang.notcmd}`, null, Markup
                .keyboard([
                    [
                      Markup.button(lang.start, 'primary'),
                    ],
                ])
            )
        }
        
        switch (ctx.cmd) {
            case ctx.user.f_name: 
                let text = ``
                text += `🔎 UID: ${ctx.user.uid}\n`
                text += ` 👤 Статус Аккаунта: ${ctx.user._acclvl}\n`
                text += `🌟 Уровень: ${ctx.user.level} [${ctx.user.exp}/${100*(ctx.user.level+1)}]\n`
                text += `🧤 Расса: ${ctx.user.race === 0 && 'Без Рассы'}\n`
                text += `⚡ Очки Энергии: ${ctx.user.energy}\n`
                text += `🔔 Уведомления: ${ctx.user.alert ? 'Включены' : 'Выключены'}\n`
                text += `\n📗 Дата регистрации: ${ctx.user.regDate}`

                return await ctx.reply(`Профиль\n ${text}`)
            case `${ctx.user.balance} ${lang.curr}`:
                let inv = ``
                inv += `💠 Баланс: ${ctx.user.balance}\n`
                inv += `${lang.herbs}: ${ctx.user.inv.herbs}\n`
                inv += `${lang.ore}: ${ctx.user.inv.ore}\n`
                inv += `${lang.sand}: ${ctx.user.inv.sand}\n`
                inv += `${lang.wood}: ${ctx.user.inv.wood}\n`
                inv += `${ctx.user.inv.rareHerbs === 0 ? '' : `🍀 Редкие Травы: ${ctx.user.inv.rareHerbs}\n`}`
                inv += `${ctx.user.inv.rareOre === 0 ? '' : `💎 Редкая Руда: ${ctx.user.inv.rareOre}\n`}`
                inv += `\n👜 Вес Инвентаря: ${ctx.user.currWeight}/${ctx.user.invWeight}\n`
               
                return await ctx.reply(`Инвентарь\n ${inv}`)
            case lang.start:
                return await ctx.scene.enter('menu')
            case lang.setting:
                return await ctx.scene.enter('setting')
            case lang.crafts:
                return await ctx.scene.enter('job')
            case 'jobs':
                return await ctx.reply('Где будем работать?', null, Markup
                .keyboard(
                    [
                    Markup.button('Травы', 'default', 'herbjob')
                    ]
                )
                .inline()
                )
            case 'herbjob':
                await ctx.reply('Поработали бум дальше?', null, Markup
                .keyboard(
                    [
                    Markup.button('Повторить', 'default', 'herbjob')
                    ]
                )
                .inline()
                )
                await ctx.user.inc('balance', 1).then(ctx.reply(ctx.user.balance))
                return
            case lang.market:
                ctx.reply(`Что вы хотели-бы продать?`, null, Markup
                    .keyboard([
                        [
                            Markup.button(lang.herbs, 'primary', 'herbs'),
                            Markup.button(lang.ore, 'primary', 'ore'),
                        ],
                        [
                            Markup.button(lang.sand, 'primary', 'sand'),
                            Markup.button(lang.wood, 'primary', 'wood'),
                        ],
                        [
                            Markup.button(lang.back, 'negative', 'menu'),
                        ]
                    ])
                )
                return
            case 'herbs':
                ctx.reply(`Сколько ${lang[ctx.cmd]} вы хотите продать?`, null, Markup
                    .keyboard(
                        [
                            Markup.button(100, 'default', `${ctx.cmd}.sell.100`),
                            Markup.button(500, 'default', `${ctx.cmd}.sell.500`),
                            Markup.button(1000, 'default', `${ctx.cmd}.sell.1000`),
                            Markup.button(lang.all, 'default', `${ctx.cmd}.sell.all`),
                        ],
                    )
                    .inline()
                )
                return
            case 'herbs.sell.100':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], 1.3)
                return
            case 'herbs.sell.500':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], 1.3)
                return
            case 'herbs.sell.1000':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], 1.3)
                return
            case `herbs.sell.all`:
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], 1.3)
                return
            case 'ore':
                ctx.reply(`Сколько ${lang[ctx.cmd]} вы хотите продать?`, null, Markup
                    .keyboard(
                        [
                            Markup.button(100, 'default', `${ctx.cmd}.sell.100`),
                            Markup.button(500, 'default', `${ctx.cmd}.sell.500`),
                            Markup.button(1000, 'default', `${ctx.cmd}.sell.1000`),
                            Markup.button(lang.all, 'default', `${ctx.cmd}.sell.all`),
                        ],
                    )
                    .inline()
                )
                return
            case 'ore.sell.100':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], 1.3)
                return
            case 'ore.sell.500':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], 1.3)
                return
            case 'ore.sell.1000':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], 1.3)
                return
            case `ore.sell.all`:
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], 1.3)
                return
            case 'sand':
                ctx.reply(`Сколько ${lang[ctx.cmd]} вы хотите продать?`, null, Markup
                    .keyboard(
                        [
                            Markup.button(100, 'default', `${ctx.cmd}.sell.100`),
                            Markup.button(500, 'default', `${ctx.cmd}.sell.500`),
                            Markup.button(1000, 'default', `${ctx.cmd}.sell.1000`),
                            Markup.button(lang.all, 'default', `${ctx.cmd}.sell.all`),
                        ],
                    )
                    .inline()
                )
                return
            case 'sand.sell.100':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0])
                return
            case 'sand.sell.500':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0])
                return
            case 'sand.sell.1000':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0])
                return
            case `sand.sell.all`:
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0])
                return
            case 'wood':
                ctx.reply(`Сколько ${lang[ctx.cmd]} вы хотите продать?`, null, Markup
                    .keyboard(
                        [
                            Markup.button(100, 'default', `${ctx.cmd}.sell.100`),
                            Markup.button(500, 'default', `${ctx.cmd}.sell.500`),
                            Markup.button(1000, 'default', `${ctx.cmd}.sell.1000`),
                            Markup.button(lang.all, 'default', `${ctx.cmd}.sell.all`),
                        ],
                    )
                    .inline()
                )
                return
            case 'wood.sell.100':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0])
                return
            case 'wood.sell.500':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0])
                return
            case 'wood.sell.1000':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0])
                return
            case `wood.sell.all`:
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0])
                return
            case lang.land:
                if (!ctx.user.plot.own) return await ctx.reply('У вас нет участка')
                return await ctx.reply(lang.inDev)
            case lang.nick:
                    return await ctx.scene.enter('menu', [1])
            default: 
                if (ctx.message.id === 0) return
                await ctx.reply(`${ctx.message.text} ${lang.notcmd}`)
                await ctx.scene.enter('menu')

                return
        }

    })
}
