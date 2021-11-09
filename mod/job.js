const Markup = require('node-vk-bot-api/lib/markup')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const randCurr = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
}

class Job {

    constructor(bot, ctx, itemdb) {
        this.bot = bot
        this.ctx = ctx
        this.itemdb = itemdb

        this.cb = {}
        this.cb.reply = async (message) => {
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

        const lvlx = 1 + (0.01 * this.ctx.user.boosters.harvest)

        this.jobs = {
            leave: {
                id: 'leaveJob',
                energy: 1,
                level: 1,
                lvlx: lvlx,
            },
            herbs: {
                id: lang.field,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.harv),
            },
            ore: {
                id: lang.mine,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.mine)
            },
            sand: {
                id: lang.beach,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.dig)
            },
            wood: {
                id: lang.forest,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.log)
            },
            herbs10: {
                id: lang.field10,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.harv),
            },
            ore10: {
                id: lang.mine10,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.mine)
            },
            sand10: {
                id: lang.beach10,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.dig)
            },
            wood10: {
                id: lang.forest10,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.log)
            },
            herbs100: {
                id: lang.field100,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.harv),
            },
            ore100: {
                id: lang.mine100,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.mine)
            },
            sand100: {
                id: lang.beach100,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.dig)
            },
            wood100: {
                id: lang.forest100,
                energy: 1,
                level: 1,
                lvlx: lvlx + (0.1 * this.ctx.user.skils.log)
            },
            fishing: {
                id: lang.fishing,
                energy: 4,
                energyX: 1,
                level: 4,
                lvlx: lvlx + (0.01 * this.ctx.user.skils.fish),
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
                    fishChest: {
                        id: 'fishChest',
                        label: '📦',
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
        await this.bot.execute('messages.getByConversationMessageId', {
            peer_id: this.ctx.message.user_id,
            conversation_message_ids: this.ctx.message.conversation_message_id,
        }).then(msg => {
            return this.bot.execute('messages.delete', {
                peer_id: this.ctx.message.user_id,
                message_id: msg.items[0].id,
                delete_for_all: 1,
            })
            .catch(e => {})
        })
        .catch(e => {})
    }

    async canStartJob() {

        if (this.ctx.user.level < 0) {
            await this.cb.reply('Ваш уровень слишком низкий. Извините, на данный момент вы не можете работать')
            return false
        }
         else if (this.ctx.user.currWeight > this.ctx.user.invWeight) {
            await this.cb.reply('Инвентарь перегружен разгрузитесь и возвращайтесь')
            return false
        }
         else if ([this.jobs.fishing.id, this.jobs.fishing.places.baikal.id, this.jobs.fishing.places.hafen.id].includes(this.ctx.cmd) && this.ctx.user.level < this.jobs.fishing.level) {
            return await this.cb.reply(`Простите, но рыбалка доступна с ${this.jobs.fishing.level} уровня.`)
        }
         else if ([this.jobs.fishing.places.baikal.id, this.jobs.fishing.places.hafen.id].includes(this.ctx.cmd) && this.ctx.user.energy < this.jobs.fishing.energy) {
            return await this.cb.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
        }
        else if ([this.jobs.herbs.id, this.jobs.ore.id, this.jobs.wood.id, this.jobs.sand.id].includes(this.ctx.cmd) && this.ctx.user.timers.hasWorked) {
            return await this.cb.reply(`Вы уже работаете ${lang[this.ctx.user.timers.mainWork]}ом`)
        }
        return true
    }

    async collect(res, mult, rarRes, expColl, rChance, rMin, rMax, resIco, rareResIco) {
        if (this.ctx.user.energy < (this.jobs[res].energy * mult)) {
            await this.cb.reply(`Вы устали, у вас ${this.ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            return
        }

        await this.ctx.user.dec('energy', (this.jobs[res].energy * mult))

        const num = []
        let sum = 0
        for (let i = 0; i < mult; i++) {
            num[i] = Math.round(randCurr(rMin, rMax) * this.jobs[res].lvlx)
            sum = sum + num[i]
        }
        const earn = sum
        let bait = 0
        const rareBait = []
        if (res === 'herbs') {
            for (let i = 0; i < mult; i++) {
                rareBait[i] = randCurr(0, 50)
                if (rareBait[i] === 27) {
                    bait = bait + 5
                }
            }
        }
        const rare = []
        let rRes = 0
        for (let i = 0; i < mult; i++) {
            rare[i] = randCurr(0, rChance)
            if (rare[i] === 27) {
                rRes = rRes + 1
            }
        }
        this.ctx.user.inv[res] = this.ctx.user.inv[res] + earn
        this.ctx.user.inv[rarRes] = this.ctx.user.inv[rarRes] + rRes
        this.ctx.user.skilsExp[expColl] = this.ctx.user.skilsExp[expColl] + (1 * mult)
        this.ctx.user.exp = this.ctx.user.exp + (1 * mult)
        await this.ctx.user.save()
        await this.ctx.user.inc('items', bait, 'bait')
        await this.cb.reply(`Вы добыли ${earn} ${resIco} ${rRes > 0 ? `и ${rRes} ${rareResIco}️` : ''} ${bait > 0 ? `и ${bait} 🐛` : ''} у вас еще ${this.ctx.user.energy} ⚡`)
    }

    async fishing() {
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
        const item = await this.itemdb.findOne({id: 3})
        if (!this.ctx.user.invent.find(x => x.item.toString() === item._id.toString())) return this.cb.reply('У вас нет удочки 🎣')
        if (this.ctx.user.items.bait === 0) {return this.cb.reply('У вас нет наживки 🐛')}
        await this.ctx.user.dec('energy', this.jobs.fishing.energy)
        await this.ctx.user.inc('exp', this.jobs.fishing.energy)
        await this.ctx.user.inc('skilsExp', 1, 'fish')
        await this.cb.reply(`Вы закинули удочку у вас еще ${this.ctx.user.energy} энергии.`)
        let massFish = []
        let buttonMass = []
        for (let i = 0; i < 10; i++) {
            const randFish = randCurr(0, 1000)
                if (randFish < 300) {
                    massFish[i] = this.jobs.fishing.places.fishY
                } else
                if (randFish > 300 && randFish < 350) {
                    massFish[i] = this.jobs.fishing.places.fishZ
                } else
                if (randFish > 350 && randFish < 352) {
                    massFish[i] = this.jobs.fishing.places.fishChest
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
    }

    collectBaikalX() {
        if (this.ctx.user.items.bait < 1) {return this.cb.reply('Недостаточно наживки 🐛')}
        try {
            this.deleteMesage().then(async() => {
                const earn = Math.round(randCurr(1, 5) * this.jobs.fishing.lvlx)
                await this.ctx.user.dec('items', 1, 'bait')
                await this.ctx.user.inc('inv', earn, 'fish')
                await this.cb.reply(`Эххх ну так себе вы поймали ${earn} 🐟 у вас еще ${this.ctx.user.items.bait} наживки.`)
            })
        } catch(e) {console.log(e)}
    }

    collectBaikalY() {
        if (this.ctx.user.items.bait < 1) {return this.cb.reply('Недостаточно наживки 🐛')}
        try {
            this.deleteMesage().then(async() => {
                const earn = Math.round(randCurr(4, 10) * this.jobs.fishing.lvlx)
                await this.ctx.user.dec('items', 1, 'bait')
                await this.ctx.user.inc('inv', earn, 'fish')
                await this.cb.reply(`Неплохо неплохо вы поймали ${earn} 🐟 у вас еще ${this.ctx.user.items.bait} наживки.`)
            })
        } catch(e) {console.log(e)}
    }

    collectBaikalZ() {
        if (this.ctx.user.items.bait < 1) {return this.cb.reply('Недостаточно наживки 🐛')}
        try {
            this.deleteMesage().then(async() => {
                const earn = Math.round(randCurr(10, 24) * this.jobs.fishing.lvlx)
                const rare = randCurr(0, 30)
                let rFish = 0
                rare === 3 ? rFish = 1 : rFish = 0
                await this.ctx.user.dec('items', 1, 'bait')
                await this.ctx.user.inc('inv', earn, 'fish')
                await this.ctx.user.inc('inv', rFish, 'rareFish')
                await this.cb.reply(`Уххх удачный улов вы поймали ${earn} 🐟 ${rare === 3 ? `и ${rFish} 🐡` : ''}у вас еще ${this.ctx.user.items.bait} наживки.`)
            })
        } catch(e) {console.log(e)}
    }

    collectChest() {
        if (this.ctx.user.items.bait < 1) {return this.cb.reply('Недостаточно наживки 🐛')}
        try {
            this.deleteMesage().then(async() => {
                const earn = Math.round(randCurr(5, 10) * this.jobs.fishing.lvlx)
                const rare = randCurr(0, 3000)
                let reward = ''
                rare < 2000 ? reward = 'rareFish' : rare > 2000 ? reward = 'rareHerbs' : null
                await this.ctx.user.dec('items', 1, 'bait')
                await this.ctx.user.inc('inv', earn, 'vinmt')
                await this.ctx.user.inc('inv', 1, reward)
                await this.cb.reply(`Вы поймали редкий сундук ${earn} ${lang.vinmt} ${rare < 2000 ? `и 1 🐡` : 'и 1 ☘️'}у вас еще ${this.ctx.user.items.bait} наживки.`)
            })
        } catch(e) {console.log(e)}
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
           case this.jobs.herbs.id:
                return await this.collect('herbs', 1, 'rareHerbs', 'harv', 200, 8, 23, '🌿', '☘️')
            case this.jobs.ore.id:
                return await this.collect('ore', 1, 'rareOre', 'mine', 400, 10, 24, '⛰', '💎')
            case this.jobs.sand.id:
                return await this.collect('sand', 1, 'rareSand', 'dig', 1000, 12, 48, '🏝', '🏺')
            case this.jobs.wood.id:
                return await this.collect('wood', 1, 'rareWood', 'log', 800, 16, 30, '🌲', '🌰')
            case this.jobs.herbs10.id:
                return await this.collect('herbs', 10, 'rareHerbs', 'harv', 200, 8, 23, '🌿', '☘️')
            case this.jobs.ore10.id:
                return await this.collect('ore', 10, 'rareOre', 'mine', 400, 10, 24, '⛰', '💎')
            case this.jobs.sand10.id:
                return await this.collect('sand', 10, 'rareSand', 'dig', 1000, 12, 48, '🏝', '🏺')
            case this.jobs.wood10.id:
                return await this.collect('wood', 10, 'rareWood', 'log', 800, 16, 30, '🌲', '🌰')
            case this.jobs.herbs100.id:
                return await this.collect('herbs', 100, 'rareHerbs', 'harv', 200, 8, 23, '🌿', '☘️')
            case this.jobs.ore100.id:
                return await this.collect('ore', 100, 'rareOre', 'mine', 400, 10, 24, '⛰', '💎')
            case this.jobs.sand100.id:
                return await this.collect('sand', 100, 'rareSand', 'dig', 1000, 12, 48, '🏝', '🏺')
            case this.jobs.wood100.id:
                return await this.collect('wood', 100, 'rareWood', 'log', 800, 16, 30, '🌲', '🌰')
            case this.jobs.fishing.id:
                return await this.fishing()
            case this.jobs.fishing.places.fishX.id:
                return this.collectBaikalX()
            case this.jobs.fishing.places.fishY.id:
                return this.collectBaikalY()
            case this.jobs.fishing.places.fishZ.id:
                return this.collectBaikalZ()
            case this.jobs.fishing.places.fishChest.id:
                return this.collectChest()
            case this.jobs.fishing.places.baikal.id:
                return await this.fishingBaikal()
            case this.jobs.fishing.places.hafen.id:
                return await this.collectHafen()
            default:
                return
        }

    }


    static getKeyboardX1() {
        return Markup.keyboard([
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.field100,
                        payload: JSON.stringify({cmd: lang.field100})
                    }, color: 'primary',
                }),
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.mine100,
                        payload: JSON.stringify({cmd: lang.mine100})
                    }, color: 'primary',
                }),
            ],
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.beach100,
                        payload: JSON.stringify({cmd: lang.beach100})
                    }, color: 'primary',
                }),
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.forest100,
                        payload: JSON.stringify({cmd: lang.forest100})
                    }, color: 'primary',
                }),
            ],
            [
                Markup.button(lang.back, 'negative', lang.x10harv),
            ],
        ])
    }

    static getKeyboardX() {
        return Markup.keyboard([
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.field10,
                        payload: JSON.stringify({cmd: lang.field10})
                    }, color: 'primary',
                }),
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.mine10,
                        payload: JSON.stringify({cmd: lang.mine10})
                    }, color: 'primary',
                }),
            ],
            [
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.beach10,
                        payload: JSON.stringify({cmd: lang.beach10})
                    }, color: 'primary',
                }),
                Markup.button({
                    action: {
                        type: 'callback',
                        label: lang.forest10,
                        payload: JSON.stringify({cmd: lang.forest10})
                    }, color: 'primary',
                }),
            ],
            [
                Markup.button(lang.x100harv, 'primary', lang.x100harv),
                Markup.button(lang.back, 'negative', lang.crafts),
            ],
        ])
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
            ],
            [
                Markup.button(lang.x10harv, 'primary', lang.x10harv),
                Markup.button(lang.back, 'negative', 'menu'),
            ],
        ])
    }
}

module.exports = { Job }