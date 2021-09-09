const { timeout } = require('cron')

const { Job } = require('./scenes/job')

module.exports = async(bot, lang, userdb, bp) => {
    const Markup = require('node-vk-bot-api/lib/markup')

    bot.command([lang.start,lang.back,'Начать','Меню','menu'], async (ctx) => {
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

    const usersMap = new Map()
    const LIMIT = 5
    const DIFF = 105
    const TIME = 100
    bot.event('message_event', async (ctx) => {
        const cb = (message) => {
            bot.execute('messages.sendMessageEventAnswer', {
                user_id: ctx.message.user_id,
                peer_id: ctx.message.peer_id,
                event_id: ctx.message.event_id,
                event_data: JSON.stringify({
                    type: "show_snackbar",
                    text: message,
                }),
            })
        }
        ctx.message.createdTimestamp = ctx.timestamp
        if(usersMap.has(ctx.message.peer_id)) {
        const userData = usersMap.get(ctx.message.peer_id);
        const { lastMessage, timer } = userData;
        const difference = ctx.message.createdTimestamp - lastMessage.createdTimestamp;
        let msgCount = userData.msgCount
        cb(`Подождите немного ${difference} ms`)

        if(difference > DIFF) {
            clearTimeout(timer)
            console.log('Cleared Timeout')
            userData.msgCount = 1
            userData.lastMessage = ctx.message
            userData.timer = setTimeout(() => {
                usersMap.delete(ctx.message.peer_id)
                console.log('Removed from map.')
            }, TIME)
            usersMap.set(ctx.message.peer_id, userData)
        }
        else {
            ++msgCount
            if(parseInt(msgCount) === LIMIT) {

               ctx.reply("Warning: Spamming forbidden.")
               
            } else {
                userData.msgCount = msgCount;
                usersMap.set(ctx.message.peer_id, userData)
            }
        }
        }
        else {
            let fn = setTimeout(async () => {
                usersMap.delete(ctx.message.peer_id)
                // console.log('Removed from map.')
                const job = new Job(bot, ctx)
                await job.workhard()
            }, TIME);
            usersMap.set(ctx.message.peer_id, {
                msgCount: 1,
                lastMessage : ctx.message,
                timer : fn
            })
        }
    })

    await bot.event('message_reply', async (ctx, next) => {
        // console.log(ctx)

        return next()
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
                return await bot.sendMessage([671833319,427691466], cmba.join().replace(/,/g, ' ').replace('report', `@id${ctx.user.id}(${ctx.user.f_name})`))
        } else
        if (cmba[0] === 'ansv') {
                if (ctx.user.acclvl < 7) return lang.noPerm
                if (Number(cmba[1])) {
                await bot.sendMessage(cmba[1], cmba.join().replace(/,/g, ' ').replace(cmba[1], '').replace('ansv', `@id${ctx.user.id}(${ctx.user.f_name})`))
                } else lang.errorinput
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
                inv += `💠 Оргулы: ${ctx.user.balance}\n`
                inv += `${lang.herbs}: ${ctx.user.inv.herbs}\n`
                inv += `${lang.ore}: ${ctx.user.inv.ore}\n`
                inv += `${lang.sand}: ${ctx.user.inv.sand}\n`
                inv += `${lang.wood}: ${ctx.user.inv.wood}\n`
                inv += `${ctx.user.inv.rareHerbs === 0 ? '' : `🍀 Редкие Травы: ${ctx.user.inv.rareHerbs}\n`}`
                inv += `${ctx.user.inv.rareOre === 0 ? '' : `💎 Редкая Руда: ${ctx.user.inv.rareOre}\n`}`
                inv += `🐟 Рыба: ${ctx.user.inv.fish}\n`
                inv += `${ctx.user.inv.rareFish === 0 ? '' : `🐡 Редкая Рыба: ${ctx.user.inv.rareFish}\n`}`
                inv += `\n${!ctx.user.items.fishingRod ? '' : `🎣 Удочка: Есть\n`}`
                inv += `${ctx.user.items.bait === 0 ? '' : `🐛 Наживка: ${ctx.user.items.bait}\n`}`
                inv += `${ctx.user.items.energyPotion === 0 ? '' : `🧪 Зелье ОЭ: ${ctx.user.items.energyPotion}\n`}`
                inv += `\n👜 Вес Инвентаря: ${ctx.user.currWeight}/${ctx.user.invWeight}\n`

                return await ctx.reply(`Инвентарь\n ${inv}`)
            case lang.start:
                return await ctx.scene.enter('menu')
            case 'menu':
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
                                // Markup.button(`Кнопка`, 'secondary'),
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
            case lang.setting:
                return await ctx.scene.enter('setting')
            case lang.crafts:
                return await ctx.reply(`Выбирете направление вашего дальнейшего пути! У вас ${ctx.user.energy}⚡`, null, Job.getKeyboard())
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
                ctx.reply(`Куда вы направляетесь?`, null, Markup
                    .keyboard([
                        [
                            Markup.button('Продать материалы', 'primary', 'market.sell.ore'),
                            Markup.button('Купить', 'primary', 'market.buy.items'),
                        ],
                        [
                            Markup.button(lang.back, 'negative', 'menu'),
                        ]
                    ])
                )
                return
            case 'market.buy.items':
                ctx.reply(`Что вы хотели-бы купить?`, null, Markup
                    .keyboard([
                        [
                            Markup.button('Удочка', 'primary', 'fishingRod'),
                            Markup.button('Наживка', 'primary', 'bait'),
                        ],
                        [
                            Markup.button('Банка ОЭ', 'primary', 'energyPotion'),
                            Markup.button(lang.inDev, 'primary'),
                        ],
                        [
                            Markup.button(lang.back, 'negative', lang.market),
                        ]
                    ])
                )
                return
            case 'energyPotion':
                ctx.reply(`Зелье Энергии 6 500 ${lang.curr} восстанавливает 25 ОЭ.`, null, Markup
                    .keyboard(
                        [
                            Markup.button('Купить', 'default', `${ctx.cmd}.buy`),
                            Markup.button('Отмена', 'default', `menu`),
                        ],
                    )
                    .inline()
                )
                return
            case 'energyPotion.buy':
                if (ctx.user.balance < 6500) {return ctx.reply('Недостаточно средств')}
                await ctx.user.dec('balance', 6500)
                await ctx.bank.inc('balance', 6500)
                await ctx.user.inc('items', 1, 'energyPotion')
                await ctx.reply('Вы успешно приобрели 🧪')
                return
            case 'fishingRod':
                ctx.reply(`Удочка стоит 5 000 ${lang.curr}.`, null, Markup
                    .keyboard(
                        [
                            Markup.button('Купить', 'default', `${ctx.cmd}.buy`),
                            Markup.button('Отмена', 'default', `menu`),
                        ],
                    )
                    .inline()
                )
                return
            case 'fishingRod.buy':
                if (ctx.user.balance < 5000) {return ctx.reply('Недостаточно средств')}
                if (ctx.user.items.fishingRod) {return ctx.reply('У вас уже есть удочка 🎣')}
                await ctx.user.dec('balance', 5000)
                await ctx.bank.inc('balance', 5000)
                await ctx.user.set('items', true, 'fishingRod')
                await ctx.reply('Вы успешно приобрели 🎣')
                return
            case 'bait':
                ctx.reply(`Текущий курс 1 Наживка 🐛 = 20 ${lang.curr}\nСколько вы хотите купить?.`, null, Markup
                    .keyboard(
                        [
                            Markup.button(10, 'default', `${ctx.cmd}.buy.10`),
                            Markup.button(50, 'default', `${ctx.cmd}.buy.50`),
                            Markup.button(100, 'default', `${ctx.cmd}.buy.100`),
                        ],
                    )
                    .inline()
                )
                return
            case 'bait.buy.10':
                if (ctx.user.balance < 20*10) {return ctx.reply('Недостаточно средств')}
                await ctx.user.dec('balance', 20*10)
                await ctx.bank.inc('balance', 20*10)
                await ctx.user.inc('items', 10, 'bait')
                await ctx.reply('Вы успешно приобрели 10 🐛') 
                return
            case 'bait.buy.50':
                if (ctx.user.balance < 20*50) {return ctx.reply('Недостаточно средств')}
                await ctx.user.dec('balance', 20*50)
                await ctx.bank.inc('balance', 20*50)
                await ctx.user.inc('items', 50, 'bait')
                await ctx.reply('Вы успешно приобрели 50 🐛')
                return
            case 'bait.buy.100':
                if (ctx.user.balance < 20*100) {return ctx.reply('Недостаточно средств')}
                await ctx.user.dec('balance', 20*100)
                await ctx.bank.inc('balance', 20*100)
                await ctx.user.inc('items', 100, 'bait')
                await ctx.reply('Вы успешно приобрели 100 🐛')
                return
            case 'market.sell.ore':
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
                            Markup.button(lang.back, 'negative', lang.market),
                        ]
                    ])
                )
                return
            case 'herbs':
                ctx.reply(`Текущий курс 1 ${lang.herbs} = ${ctx.bank.dpi.herbs} ${lang.curr}\nСколько вы хотите продать?.`, null, Markup
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
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.herbs)
                return
            case 'herbs.sell.500':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.herbs)
                return
            case 'herbs.sell.1000':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.herbs)
                return
            case `herbs.sell.all`:
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.herbs)
                return
            case 'ore':
                ctx.reply(`Текущий курс 1 ${lang.ore} = ${ctx.bank.dpi.ore} ${lang.curr}\nСколько вы хотите продать?.`, null, Markup
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
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.ore)
                return
            case 'ore.sell.500':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.ore)
                return
            case 'ore.sell.1000':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.ore)
                return
            case `ore.sell.all`:
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.ore)
                return
            case 'sand':
                ctx.reply(`Текущий курс 1 ${lang.sand} = ${ctx.bank.dpi.sand} ${lang.curr}\nСколько вы хотите продать?.`, null, Markup
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
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.sand)
                return
            case 'sand.sell.500':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.sand)
                return
            case 'sand.sell.1000':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.sand)
                return
            case `sand.sell.all`:
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.sand)
                return
            case 'wood':
                ctx.reply(`Текущий курс 1 ${lang.wood} = ${ctx.bank.dpi.wood} ${lang.curr}\nСколько вы хотите продать?.`, null, Markup
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
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.wood)
                return
            case 'wood.sell.500':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.wood)
                return
            case 'wood.sell.1000':
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.wood)
                return
            case `wood.sell.all`:
                marketSell(ctx.cmd.split('.')[2], ctx.cmd.split('.')[0], ctx.bank.dpi.wood)
                return
            case lang.land:
                if (!ctx.user.plot.own) return await ctx.reply(`У вас есть участок но его поверхность неподходит для строительства необходимо 15000 ${lang.sand} что-бы его выровнять.`, null, Markup
                    .keyboard(
                        [
                            Markup.button('Выровнять участок', 'default', 'plot.align'),
                            // Markup.button('Купить выравнивание', 'default', ``),
                        ],
                    )
                    .inline()
                )

                let plot = ``
                plot += `🏠 Дом: ${null}\n`
                plot += `🏚 Склад: ${null}\n`
                plot += `⛪️ Храм: ${null}\n`
                plot += `⛰ Рудник: ${null}\n`

                plot += `\n\nРазмер участка: ${ctx.user.plot.size === 0 && 'Малый'}`

                return await ctx.reply(`Участок:\n ${plot}`)
            case 'plot.align':
                return await ctx.reply(`Выроврять участок под строительство с вас спишется \n15000 ${lang.sand}`, null, Markup
                    .keyboard(
                        [
                            Markup.button('Да', 'default', 'plot.align.yes'),
                            Markup.button('Нет', 'default', 'menu'),
                        ],
                    )
                    .inline()
                    )
            case 'plot.align.yes':
                if (ctx.user.inv.sand < 15000) return ctx.reply('Недостаточно средств')
                await ctx.user.dec('inv', 15000, 'sand')
                await ctx.user.set('plot', true, 'own')
                await ctx.reply('Теперь на вашем участке можно строить')
                return
            case lang.nick:
                    return await ctx.scene.enter('menu', [1])
            default:
                if (ctx.message.id === 0) return
                // await ctx.reply(`${ctx.message.text} ${lang.notcmd}`)
                // await ctx.scene.enter('menu')

                return
        }

    })
}
