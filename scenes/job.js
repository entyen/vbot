const Markup = require('node-vk-bot-api/lib/markup')

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
        this.cb = eventAnswer;

        const lvlx = this.ctx.user.level <= 0 ? 1 : 1 + (this.ctx.user.level * 0.2)

        this.jobs = {
            herb: {
                id: lang.field,
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            ore: {
                id: lang.mine,
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            sand: {
                id: lang.beach,
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            forest: {
                id: lang.forest,
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            fishing: {
                id: lang.fishing,
                energy: 0,
                level: 0,
                lvlx: lvlx,
                places: {
                    baikal: {
                        id: 'baikal',
                        label: 'Байкал',
                    },
                    hafen: {
                        id: 'hafen',
                        label: 'Морской порт',
                    }
                }
            }
        }
    }

    async canStartJob() {

        if (this.ctx.user.level < 0) {
            await this.cb.reply('Ваш уровень слишком низкий. Извините, на данный момент вы не можете работать')
            return false
        } else if (this.ctx.user.currWeight > this.ctx.user.invWeight) {
            await this.cb.reply('Инвентарь перегружен разгрузитесь и возвращайтесь')
            return false
        } else if ([this.jobs.fishing.id, this.jobs.fishing.places.baikal.id, this.jobs.fishing.places.hafen.id].includes(this.ctx.cmd) && this.ctx.user.level < this.jobs.fishing.level) {
            return await this.cb.reply(`Простите, но рыбалка доступна с ${this.jobs.fishing.level} уровня.`)
        } else if ([this.jobs.fishing.id, this.jobs.fishing.places.baikal.id, this.jobs.fishing.places.hafen.id].includes(this.ctx.cmd) && this.ctx.user.energy < this.jobs.fishing.energy) {
            return await this.cb.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
        }

        return true
    }

    async collectHerbs() {
        if (this.ctx.user.energy < this.jobs.herb.energy) {
            await this.cb.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            return
        }

        this.ctx.user.energy = this.ctx.user.energy - this.jobs.herb.energy

        const rare = randCurr(0, 200)
        const earn = Math.round(randCurr(5, 18) * this.jobs.herb.lvlx)

        rare === 27 ? this.ctx.user.inv.rareHerbs = this.ctx.user.inv.rareHerbs + 1 : null
        this.ctx.user.inv.herbs = this.ctx.user.inv.herbs + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.cb.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 27 ? 'и 1 🍀' : ''} у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async collectOre() {
        if (this.ctx.user.energy < this.jobs.ore.energy) {
            await this.cb.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            return
        }

        this.ctx.user.energy = this.ctx.user.energy - this.jobs.ore.energy

        const rare = randCurr(0, 400)
        const earn = Math.round(randCurr(3, 24) * this.jobs.ore.lvlx)

        rare === 277 ? this.ctx.user.inv.rareOre = this.ctx.user.inv.rareOre + 1 : null
        this.ctx.user.inv.ore = this.ctx.user.inv.ore + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.cb.reply(`Вы направились в горную шахту и добыли ${earn} ⛰ ${rare === 277 ? 'и 1 💎' : ''} у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async collectSand() {
        if (this.ctx.user.energy < this.jobs.sand.energy) {
            await this.cb.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            return
        }

        this.ctx.user.energy = this.ctx.user.energy - this.jobs.sand.energy

        const earn = Math.round(randCurr(8, 48) * this.jobs.sand.lvlx)

        this.ctx.user.inv.sand = this.ctx.user.inv.sand + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.cb.reply(`Вы направились на пляж и откопали ${earn} 🏝 у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async collectForest() {
        if (this.ctx.user.energy < this.jobs.forest.energy) {
            return await this.cb.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
        }

        this.ctx.user.energy = this.ctx.user.energy - this.jobs.forest.energy

        const earn = Math.round(randCurr(16, 28) * this.jobs.forest.lvlx)

        this.ctx.user.inv.wood = this.ctx.user.inv.wood + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.cb.reply(`Вы направились в лес и нарубили ${earn} 🌲 у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async fishing() {
        // if (this.ctx.user.level < this.jobs.fishing.level) {
        //     return await this.cb.reply(`Простите, но рыбалка доступна с ${this.jobs.fishing.level} уровня.`)
        // } else if (this.ctx.user.energy < this.jobs.fishing.energy) {
        //     return await this.cb.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
        // }

        await this.cb.reply('Вы отправляетесь на рыбалку, выберите место, куда идти')
        await this.ctx.reply(`Места для рыбалки:`, null, Markup
            .keyboard([
                [
                    Markup.button({
                        action: {
                            type: 'callback',
                            label: this.jobs.fishing.places.baikal.label,
                            payload: JSON.stringify({cmd: this.jobs.fishing.places.baikal.id})
                        }, color: 'default',
                    }),
                    Markup.button({
                        action: {
                            type: 'callback',
                            label: this.jobs.fishing.places.hafen.label,
                            payload: JSON.stringify({cmd: this.jobs.fishing.places.hafen.id})
                        }, color: 'default',
                    }),
                ],
            ])
            .inline()
        )

        // await this.ctx.user.dec('energy', this.jobs.fishing.energy)

        //const earn = Math.round(randCurr(0, 0) * this.jobs.fishing.lvlx)

        // ctx.user.inv.wood = ctx.user.inv.wood+earn
        // ctx.user.exp = ctx.user.exp+1
        // await ctx.user.save()

        // await cb.reply(`Вы направились на рыбалку и поймали ${earn} 🐟 у вас еще ${ctx.user.energy} энергии.`)
        //await this.cb.reply(lang.inDev)
    }

    async collectBaikal() {
        await this.ctx.user.dec('energy', this.jobs.fishing.energy)
        const earn = Math.round(randCurr(0, 260) * this.jobs.fishing.lvlx)
        await this.ctx.user.save()
        await this.cb.reply(`Вы направились на рыбалку и поймали ${earn} 🐟 у вас еще ${this.ctx.user.energy} энергии.`)
    }

    async collectHafen() {
        await this.ctx.user.dec('energy', this.jobs.fishing.energy)
        const earn = Math.round(randCurr(0, 100) * this.jobs.fishing.lvlx)
        await this.ctx.user.save()
        await this.cb.reply(`Вы направились на рыбалку и поймали ${earn} 🐟 у вас еще ${this.ctx.user.energy} энергии.`)
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
            case this.jobs.fishing.places.baikal.id:
                return await this.collectBaikal()
            case this.jobs.fishing.places.hafen.id:
                return await this.collectHafen()
            default:
                await this.ctx.scene.enter('menu')
                return
        }

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
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.back,
                        payload: JSON.stringify({cmd: lang.back})
                    }, color: 'negative',
                }),
                // Markup.button(lang.back, 'negative'),
            ],
        ])
    }
}

module.exports = { Job }
