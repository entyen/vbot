const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const randCurr = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
}

class Job {

    constructor(bot, ctx) {
        this.bot = bot
        this.ctx = ctx

        const eventAnswer = {}
        eventAnswer.reply = async (message) => {
            this.bot.execute('messages.sendMessageEventAnswer', {
                user_id: this.ctx.message.user_id,
                peer_id: this.ctx.message.peer_id,
                event_id: this.ctx.message.event_id,
                event_data: JSON.stringify({
                    type: "show_snackbar",
                    text: message,
                }),
            })
        }
        this.eventAnswer = eventAnswer;

        const lvlx = this.ctx.user.level <= 0 ? 1 : 1 + (this.ctx.user.level * 0.2)

        this.jobs = {
            herb: {
                id: lang[19],
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            ore: {
                id: lang[21],
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            sand: {
                id: lang[22],
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            forest: {
                id: lang[24],
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            fishing: {
                id: lang[25],
                energy: 4,
                level: 4,
                lvlx: lvlx,
            }
        }
    }

    async canStartJob() {

        if (this.ctx.user.level < 0) {
            await this.eventAnswer.reply('Ваш уровень слишком низкий. Извините, на данный момент вы не можете работать')
            return false
        } else if (this.ctx.user.currWeight > this.ctx.user.invWeight) {
            await this.eventAnswer.reply('Инвентарь перегружен разгрузитесь и возвращайтесь')
            return false
        }

        return true
    }

    async collectHerbs() {
        if (this.ctx.user.energy < this.jobs.herb.energy) {
            await this.eventAnswer.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            return
        }

        this.ctx.user.energy = this.ctx.user.energy - this.jobs.herb.energy

        const rare = randCurr(0, 200)
        const earn = Math.round(randCurr(5, 18) * this.jobs.herb.lvlx)

        rare === 27 ? this.ctx.user.inv.rareHerbs = this.ctx.user.inv.rareHerbs + 1 : null
        this.ctx.user.inv.herbs = this.ctx.user.inv.herbs + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.eventAnswer.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 27 ? 'и 1 🍀' : ''} у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async collectOre() {
        if (this.ctx.user.energy < this.jobs.ore.energy) {
            await this.eventAnswer.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            return
        }

        this.ctx.user.energy = this.ctx.user.energy - this.jobs.ore.energy

        const rare = randCurr(0, 400)
        const earn = Math.round(randCurr(3, 24) * this.jobs.ore.lvlx)

        rare === 277 ? this.ctx.user.inv.rareOre = this.ctx.user.inv.rareOre + 1 : null
        this.ctx.user.inv.ore = this.ctx.user.inv.ore + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.eventAnswer.reply(`Вы направились в горную шахту и добыли ${earn} ⛰ ${rare === 277 ? 'и 1 💎' : ''} у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async collectSand() {
        if (this.ctx.user.energy < this.jobs.sand.energy) {
            await this.eventAnswer.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            return
        }

        this.ctx.user.energy = this.ctx.user.energy - this.jobs.sand.energy

        const earn = Math.round(randCurr(8, 48) * this.jobs.sand.lvlx)

        this.ctx.user.inv.sand = this.ctx.user.inv.sand + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.eventAnswer.reply(`Вы направились на пляж и откопали ${earn} 🏝 у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async collectForest() {
        if (this.ctx.user.energy < this.jobs.forest.energy) {
            return await this.eventAnswer.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
        }

        this.ctx.user.energy = this.ctx.user.energy - this.jobs.forest.energy

        const earn = Math.round(randCurr(16, 28) * this.jobs.forest.lvlx)

        this.ctx.user.inv.wood = this.ctx.user.inv.wood + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.eventAnswer.reply(`Вы направились в лес и нарубили ${earn} 🌲 у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async fishing() {
        if (this.ctx.user.level < this.jobs.fishing.level) {
            return await this.eventAnswer.reply(`Простите, но рыбалка доступна с ${this.jobs.fishing.level} уровня.`)
        } else if (this.ctx.user.energy < this.jobs.fishing.energy) {
            return await this.eventAnswer.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
        }

        //ctx.user.energy = ctx.user.energy - this.jobs.fishing.energy

        const earn = Math.round(randCurr(0, 0) * this.jobs.fishing.lvlx)

        // ctx.user.inv.wood = ctx.user.inv.wood+earn
        // ctx.user.exp = ctx.user.exp+1
        // await ctx.user.save()
        // ctx.reply(`Сколько ${ctx.cmd} вы хотите продать? Вы так-же можете ввести кол-во вручную`, null, Markup
        //     .keyboard([
        //         100,
        //         500,
        //         1000,
        //         lang[38]
        //     ])
        //     .inline()
        // )


        await this.eventAnswer.reply(`Вы направились на рыбалку и поймали ${earn} 🐟 у вас еще ${this.ctx.user.energy} энергии.`)
    }

    async workhard() {

        if (!await this.canStartJob()) {
            return
        }

        switch (this.ctx.cmd) {
            case this.jobs.herb.id:
                return await this.collectHerbs()
            case this.jobs.ore.id:
                return await this.collectOre()
            case this.jobs.sand.id:
                return await this.collectSand()
            case this.jobs.forest.id:
                return await this.collectForest()
            case this.jobs.fishing.id:
                return await this.fishing()
            default:
                return await this.ctx.scene.enter('menu')
        }

    }

    static getKeyboard() {
        return Markup.keyboard([
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang[19],
                        payload: JSON.stringify({cmd: lang[19]})
                    }, color: 'primary',
                }),
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang[21],
                        payload: JSON.stringify({cmd: lang[21]})
                    }, color: 'primary',
                }),
            ],
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang[22],
                        payload: JSON.stringify({cmd: lang[22]})
                    }, color: 'primary',
                }),
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang[24],
                        payload: JSON.stringify({cmd: lang[24]})
                    }, color: 'primary',
                }),
            ],
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang[25],
                        payload: JSON.stringify({cmd: lang[25]})
                    }, color: 'primary',
                }),
                Markup.button(lang[23], 'negative'),
            ],
        ])
    }
}

module.exports = { Job }
