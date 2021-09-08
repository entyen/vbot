const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const randCurr = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
}

class Job {

    constructor() {
        this.collectCost = {
            herb: {
                energy: 1,
                level: 1,
            },
            ore: {
                energy: 1,
                level: 1,
            },
            sand: {
                energy: 1,
                level: 1,
            },
            forest: {
                energy: 1,
                level: 1,
            },
            fishing: {
                energy: 4,
                level: 4,
            }
        }
    }

    canWork(ctx, cb) {

        if (ctx.user.level < 0) {
            cb.reply('Ваш уровень слишком низкий. Извините, на данный момент вы не можете работать')
            return false
        } else if (ctx.user.currWeight > ctx.user.invWeight) {
            cb.reply('Инвентарь перегружен разгрузитесь и возвращайтесь')
            return false
        }

        const boringMessage = `Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`
        if (ctx.cmd === lang.field && ctx.user.energy < this.collectCost.herb.energy) { // проверка энергии на сбор трав
            cb.reply(boringMessage)
            return false
        } else if (ctx.cmd === lang.mine && ctx.user.energy < this.collectCost.ore.energy) { // проверка энергии на сбор руды
            cb.reply(boringMessage)
            return false
        } else if (ctx.cmd === lang.beach && ctx.user.energy < this.collectCost.sand.energy) { // проверка энергии на сбор песка
            cb.reply(boringMessage)
            return false
        } else if (ctx.cmd === lang.forest && ctx.user.energy < this.collectCost.forest.energy) { // проверка энергии на сбор леса
            cb.reply(boringMessage)
            return false
        } else if (ctx.cmd === lang.fishing) { // проверка энергии и уровня на рыбалку
            if (ctx.user.level < this.collectCost.fishing.level) {
                cb.reply(`Простите, но рыбалка доступна с ${this.collectCost.fishing.level} уровня.`)
                return false
            } else if (ctx.user.energy < this.collectCost.fishing.energy) {
                cb.reply(boringMessage)
                return false
            }
        }

        return true
    }

    async collectHerbs(ctx, cb, lvlx) {
        await ctx.user.dec('energy', this.collectCost.herb.energy)

        const rare = randCurr(0, 200)
        const earn = Math.round(randCurr(5, 18) * lvlx)

        rare === 27 ? await ctx.user.inc('inv', 1, 'rareHerbs') : null
        await ctx.user.inc('inv', earn, 'herbs')
        await ctx.user.inc('exp', 1)
        await cb.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 27 ? 'и 1 🍀' : ''} у вас еще ${ctx.user.energy} ⚡`)
    }

    async collectOre(ctx, cb, lvlx) {
        await ctx.user.dec('energy', this.collectCost.ore.energy)

        const rare = randCurr(0, 400)
        const earn = Math.round(randCurr(3, 24) * lvlx)

        rare === 277 ? await ctx.user.inc('inv', 1, 'rareOre') : null
        await ctx.user.inc('inv', earn, 'ore')
        await ctx.user.inc('exp', 1)
        await cb.reply(`Вы направились в горную шахту и добыли ${earn} ⛰ ${rare === 277 ? 'и 1 💎' : ''} у вас еще ${ctx.user.energy} ⚡`)
    }

    async collectSand(ctx, cb, lvlx) {
        await ctx.user.dec('energy', this.collectCost.sand.energy)

        const earn = Math.round(randCurr(8, 48) * lvlx)

        await ctx.user.inc('inv', earn, 'sand')
        await ctx.user.inc('exp', 1)
        await cb.reply(`Вы направились на пляж и откопали ${earn} 🏝 у вас еще ${ctx.user.energy} ⚡`)
    }

    async collectForest(ctx, cb, lvlx) {
        await ctx.user.dec('energy', this.collectCost.forest.energy)

        const earn = Math.round(randCurr(16, 28) * lvlx)

        await ctx.user.inc('inv', earn, 'wood')
        await ctx.user.inc('exp', 1)
        await cb.reply(`Вы направились в лес и нарубили ${earn} 🌲 у вас еще ${ctx.user.energy} ⚡`)
    }

    async fishing(ctx, cb, lvlx) {
        //await ctx.user.dec('energy', this.collectCost.fishing.energy)

        const earn = Math.round(randCurr(0, 0) * lvlx)

        // ctx.user.inv.wood = ctx.user.inv.wood+earn
        // ctx.user.exp = ctx.user.exp+1
        // await ctx.user.save()

        // await cb.reply(`Вы направились на рыбалку и поймали ${earn} 🐟 у вас еще ${ctx.user.energy} энергии.`)
        await cb.reply(lang.inDev)
    }

    async workhard(bot, ctx) {
        const cb = {}

        cb.reply = async (message) => {
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

        if (!this.canWork(ctx, cb)) {
            return //await ctx.scene.enter('menu')
        }

        const lvlx = ctx.user.level <= 0 ? 1 : 1 + (ctx.user.level * 0.2)
        switch (ctx.cmd) {
            case lang.field:
                return await this.collectHerbs(ctx, cb, lvlx)
            case lang.mine:
                return await this.collectOre(ctx, cb, lvlx)
            case lang.beach:
                return await this.collectSand(ctx, cb, lvlx)
            case lang.forest:
                return await this.collectForest(ctx, cb, lvlx)
            case lang.fishing:
                return await this.fishing(ctx, cb, lvlx)
            default:
                await ctx.scene.leave()
                await ctx.scene.enter('menu')
                return
        }

    }

    static getScene() {
        return new Scene('job',
            async (ctx) => {
                await ctx.reply(`Выбирете направление вашего дальнейшего пути! У вас ${ctx.user.energy}⚡`, null, this.getKeyboard())
                await ctx.scene.next()
            },
            async (ctx) => {
                const lvl = ctx.user.level
                const lvlx = ctx.user.level <= 0 ? 1 : 1 + (ctx.user.level * 0.2)

                if (ctx.user.currWeight > ctx.user.invWeight) {
                    if (ctx.cmd === lang.back) return ctx.scene.enter('menu')
                    return await ctx.reply('Инвентарь перегружен разгрузитесь и возвращайтесь')
                }
                if (ctx.cmd === lang.field && lvl >= 0) {
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
    }

    static getKeyboard() {
        return Markup.keyboard([
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.field,
                        payload: JSON.stringify({cmd: lang.field})
                    }, color: 'primary',
                }),
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.mine,
                        payload: JSON.stringify({cmd: lang.mine})
                    }, color: 'primary',
                }),
            ],
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.beach,
                        payload: JSON.stringify({cmd: lang.beach})
                    }, color: 'primary',
                }),
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.forest,
                        payload: JSON.stringify({cmd: lang.forest})
                    }, color: 'primary',
                }),
            ],
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.fishing,
                        payload: JSON.stringify({cmd: lang.fishing})
                    }, color: 'primary',
                }),
                Markup.button(lang.back, 'negative', 'menu'),
            ],
        ])
    }
}

module.exports = { Job }
