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
        this.cb = eventAnswer

        const lvlx = this.ctx.user.level <= 0 ? 1 : 1 + (this.ctx.user.boosters.harvest * 0.2)

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
                energy: 4,
                energyX: 1,
                level: 4,
                lvlx: lvlx,
                places: {
                    baikal: {
                        id: 'baikal',
                        label: 'Байкал',
                    },
                    fishX: {
                        id: 'fishX',
                        label: '🐟',
                    },
                    fishY: {
                        id: 'fishY',
                        label: '🐠',
                    },
                    fishZ: {
                        id: 'fishZ',
                        label: '🐡',
                    },
                    event: {
                        id: 'event',
                        label: '💥',
                    },
                    hafen: {
                        id: 'hafen',
                        label: 'Морской порт',
                    }
                }
            }
        }
    }

    async deleteMesage() {
        const NeedMessage = await this.bot.execute('messages.getByConversationMessageId', {
            peer_id: this.ctx.message.user_id,
            conversation_message_ids: this.ctx.message.conversation_message_id,
        })
        await this.bot.execute('messages.delete', {
            peer_id: this.ctx.message.user_id,
            message_id: NeedMessage.items[0].id,
            delete_for_all: 1,
        })
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
        } else if ([this.jobs.fishing.places.baikal.id, this.jobs.fishing.places.hafen.id].includes(this.ctx.cmd) && this.ctx.user.energy < this.jobs.fishing.energy) {
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
        const rareBait = randCurr(0, 50)
        const earn = Math.round(randCurr(5, 18) * this.jobs.herb.lvlx)
        let bait = 0

        rare === 27 ? this.ctx.user.inv.rareHerbs = this.ctx.user.inv.rareHerbs + 1 : null
        rareBait === 10 ? bait = 5 : bait = 0
        this.ctx.user.inv.herbs = this.ctx.user.inv.herbs + earn
        this.ctx.user.exp = this.ctx.user.exp + 1
        await this.ctx.user.save()
        await this.ctx.user.inc('items', bait, 'bait')
        await this.cb.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 27 ? 'и 1 🍀' : ''} ${rareBait === 10 ? `и ${bait} 🐛` : ''} у вас еще ${this.ctx.user.energy} ⚡`)
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
                            label: `${this.jobs.fishing.places.baikal.label} 4 ⚡`,
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
                [
                Markup.button(lang.back, 'negative', 'menu'),
                ]
            ])
        )
    }

    async fishingBaikal() {
        if (!this.ctx.user.items.fishingRod) {return this.cb.reply('У вас нет удочки 🎣')}
        if (this.ctx.user.items.bait === 0) {return this.cb.reply('У вас нет наживки 🐛')}
        await this.ctx.user.dec('energy', this.jobs.fishing.energy)
        await this.ctx.user.inc('exp', this.jobs.fishing.energy)
        await this.cb.reply(`Вы закинули удочку у вас еще ${this.ctx.user.energy} энергии.`)
        let massFish = []
        let buttonMass = []
        for (let i = 0; i < 10; i++) {
            const randFish = randCurr(0, 100)
                if (randFish < 30) {
                    massFish[i] = this.jobs.fishing.places.fishY
                } else
                if (randFish > 30 && randFish < 35) {
                    massFish[i] = this.jobs.fishing.places.fishZ
                } else {
                    massFish[i] = this.jobs.fishing.places.fishX
                }
            buttonMass[i] = Markup
                .button({
                    action: {
                        type: 'callback',
                        label: massFish[i].label,
                        payload: JSON.stringify({cmd: massFish[i].id})
                    }, color: 'default',
                })
        }
        await this.ctx.reply(`На рыбалку дается 1 вытягивание думай на что нажать.\nРыбалка на байкале:`, null, Markup
            .keyboard([
                [
                    buttonMass[0],
                    buttonMass[1],
                    buttonMass[2],
                    buttonMass[3],
                    buttonMass[4],
                ],
                [
                    buttonMass[5],
                    buttonMass[6],
                    buttonMass[7],
                    buttonMass[8],
                    buttonMass[9],
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
    }

    async collectBaikalX() {
        try {
            if (this.ctx.user.items.bait < 1) {return this.cb.reply('Недостаточно наживки 🐛')}
            await this.ctx.user.dec('items', 1, 'bait')
            const earn = Math.round(randCurr(1, 5))
            this.deleteMesage()
            await this.ctx.user.inc('inv', earn, 'fish')
            await this.cb.reply(`Эххх ну так себе вы поймали ${earn} 🐟 у вас еще ${this.ctx.user.items.bait} наживки.`)
        } catch (e) {'Что-то пошло не так'}
    }

    async collectBaikalY() {
        try {
            if (this.ctx.user.items.bait < 1) {return this.cb.reply('Недостаточно наживки 🐛')}
            await this.ctx.user.dec('items', 1, 'bait')
            const earn = Math.round(randCurr(4, 10))
            this.deleteMesage()
            await this.ctx.user.inc('inv', earn, 'fish')
            await this.cb.reply(`Неплохо неплохо вы поймали ${earn} 🐟 у вас еще ${this.ctx.user.items.bait} наживки.`)
        } catch (e) {'Что-то пошло не так'}
    }

    async collectBaikalZ() {
        try {
            if (this.ctx.user.items.bait < 1) {return this.cb.reply('Недостаточно наживки 🐛')}
            await this.ctx.user.dec('items', 1, 'bait')
            const earn = Math.round(randCurr(10, 24))
            this.deleteMesage()
            const rare = randCurr(0, 30)
            let rFish = 0
            rare === 3 ? rFish = 1 : rFish = 0
            await this.ctx.user.inc('inv', earn, 'fish')
            await this.ctx.user.inc('inv', rFish, 'rareFish')
            await this.cb.reply(`Уххх удачный улов вы поймали ${earn} 🐟 ${rare === 3 ? `и ${rFish} 🐡` : ''}у вас еще ${this.ctx.user.items.bait} наживки.`)
        } catch (e) {
         this.ctx.reply('Что-то пошло не так.')
        }
    }

    async collectHafen() {
        await this.ctx.user.dec('energy', this.jobs.fishing.energy)
        const earn = Math.round(randCurr(0, 0) * this.jobs.fishing.lvlx)
        // await this.cb.reply(`Вы направились на рыбалку и поймали ${earn} 🐟 у вас еще ${this.ctx.user.energy} энергии.`)
        await this.cb.reply(`${lang.inDev}`)
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
            case this.jobs.fishing.places.fishX.id:
                return await this.collectBaikalX()
            case this.jobs.fishing.places.fishY.id:
                return await this.collectBaikalY()
            case this.jobs.fishing.places.fishZ.id:
                return await this.collectBaikalZ()
            case this.jobs.fishing.places.baikal.id:
                return await this.fishingBaikal()
            case this.jobs.fishing.places.hafen.id:
                return await this.collectHafen()
            default:
                // await this.ctx.scene.enter('menu')
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
                Markup.button(lang.back, 'negative', 'menu'),
            ],
        ])
    }
}

module.exports = { Job }