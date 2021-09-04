module.exports = async(bot, lang, bp) => {
const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')

const randCurr = (min, max) => { 
        return Math.floor(Math.random() * (max - min) + min) 
}

const scene = new Scene('menu', 
    async (ctx) => {
        if (ctx.user.acclvl >= 5) {
            await ctx.reply(lang[1], null, Markup
            .keyboard([
                [
                  Markup.button(lang[8], 'primary'),
                  Markup.button(lang[32], 'primary'),
                ],
                [
                  Markup.button(ctx.user.f_name, 'secondary'),
                  Markup.button(lang[3], 'positive'),
                  Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                ],
                [
                  Markup.button(`${lang[29]}`, 'secondary'),
                ],
            ])
            )
        } else {
            await ctx.reply(lang[1], null, Markup
                .keyboard([
                    [
                      Markup.button(lang[8], 'primary'),
                      Markup.button(lang[32], 'primary'),
                    ],
                    [
                      Markup.button(ctx.user.f_name, 'secondary'),
                      Markup.button(lang[3], 'positive'),
                      Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                    ],
                    [
                      Markup.button(`${lang[29]}`, 'secondary'),
                    ],
                ])
                )
        }
        await ctx.scene.leave()
    },

    async (ctx) => {

        await ctx.scene.leave()
        await ctx.reply(`${lang[6]} ${ctx.message.text}`)
        await ctx.scene.enter('menu', [0])
    },
)

const sceneJ = new Scene('job', 
    async (ctx) => {
        ctx.reply(`Выбирете направление вашего дальнейшего пути! У вас ${ctx.user.energy}⚡`, null, Markup
            .keyboard([
                [
                  Markup.button(lang[19], 'primary'),
                  Markup.button(lang[21], 'primary'),
                ],
                [
                  Markup.button(lang[22], 'primary'),
                  Markup.button(lang[24], 'primary'),
                ],
                [
                  Markup.button(lang[25], 'primary'),
                  Markup.button(lang[23], 'negative'),
                ]
            ])
            )

        await ctx.scene.next()
    },

    async (ctx) => { 
        const lvl = ctx.user.level
        const lvlx = ctx.user.level <=0 ? 1 : 1 + (ctx.user.level*0.2)

        if (ctx.user.currWeight > ctx.user.invWeight) {
          if (ctx.cmd === lang[23]) return ctx.scene.enter('menu')
          return await ctx.reply('Инвентарь перегружен разгрузитесь и возвращайтесь')
        }
        if (ctx.cmd === lang[19] && lvl >= 0) {
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
            earn = Math.round(earn*lvlx)

            rare === 27 ? ctx.user.inv.rareHerbs = ctx.user.inv.rareHerbs+1 : null
            ctx.user.inv.herbs = ctx.user.inv.herbs+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 27 ? 'и 1 🍀' : ''} у вас еще ${ctx.user.energy} ⚡`)
            }
        } else
        if (ctx.cmd === lang[21] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

            ctx.user.energy = ctx.user.energy - 1

            let earn = randCurr(3, 24)
            const rare = randCurr(0, 400)
            earn = Math.round(earn*lvlx)

            rare === 277 ? ctx.user.inv.rareOre = ctx.user.inv.rareOre+1 : null
            ctx.user.inv.ore = ctx.user.inv.ore+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы направились в горную шахту и добыли ${earn} ⛰ ${rare === 277 ? 'и 1 💎' : ''} у вас еще ${ctx.user.energy} ⚡`)
            }
        } else
        if (ctx.cmd === lang[22] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

            ctx.user.energy = ctx.user.energy - 1

            let earn = randCurr(8, 48)
            earn = Math.round(earn*lvlx)

            ctx.user.inv.sand = ctx.user.inv.sand+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы направились на пляж и откопали ${earn} 🏝 у вас еще ${ctx.user.energy} ⚡`)
            }
        } else
        if (ctx.cmd === lang[24] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

            ctx.user.energy = ctx.user.energy - 1

            let earn = randCurr(16, 28)
            earn = Math.round(earn*lvlx)

            ctx.user.inv.wood = ctx.user.inv.wood+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы направились в лес и нарубили ${earn} 🌲 у вас еще ${ctx.user.energy} ⚡`)
            }
        } else
        if (ctx.cmd === lang[25] && lvl >= 0) {
          if (lvl <= 4) return ctx.reply(`Протите но рыбалка доступна с 4 уровня.`)
            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

            // ctx.user.energy = ctx.user.energy - 1

            let earn = randCurr(0, 0)
            earn = Math.round(earn*lvlx)

            // ctx.user.inv.wood = ctx.user.inv.wood+earn
            // ctx.user.exp = ctx.user.exp+1
            // await ctx.user.save()

            await ctx.reply(`Вы направились на рыбалку и поймали ${earn} 🐟 у вас еще ${ctx.user.energy} энергии.`)
            }
        } else {
          await ctx.scene.leave()
          await ctx.scene.enter('menu')
        }
    },
)

const sceneS = new Scene ('setting', 
    async (ctx) => {
        const alertState = ctx.user.alert ? 'positive' : 'negative'
        const acclvl = ctx.user.acclvl >= 5 ? 'primary' : 'secondary'
        await ctx.reply('Настройки', null, Markup
            .keyboard([
                [
                  Markup.button(`${ctx.user._acclvl}`, acclvl),
                ],
                [
                  Markup.button(lang[30], alertState),
                  Markup.button(lang[23], 'negative'),
                ],
            ])
            )
        await ctx.scene.next()
    },

    async (ctx) => {
      if (ctx.cmd === lang[30]) {
          if (ctx.user.alert) {
              ctx.user.alert = false
              await ctx.user.save()
              await ctx.reply(`${lang[30]} ${ctx.user.alert ? 'Включены' : 'Выключены'}` )
              await ctx.scene.leave()
              await ctx.scene.enter('setting')
          } else {
              ctx.user.alert = true
              await ctx.user.save()
              await ctx.reply(`${lang[30]} ${ctx.user.alert ? 'Включены' : 'Выключены'}`)
              await ctx.scene.leave()
              await ctx.scene.enter('setting')
          }
      } else
      if (ctx.cmd === lang[11] || ctx.cmd === lang[10] || ctx.cmd === lang[9] || ctx.cmd === lang[26] || ctx.cmd === lang[27] || ctx.cmd === lang[28]) {
        ctx.user.acclvl >= 7 ? ctx.reply(`${lang[17]} ${lang[11]} ${lang[37]} ${lang[18]}`)
        : ctx.user.acclvl == 6 ? ctx.reply(`${lang[17]} ${lang[10]} ${lang[37]}`)
        : ctx.user.acclvl == 5 ? ctx.reply(`${lang[17]} ${lang[9]} ${lang[37]}`)
        : ctx.user.acclvl == 2 ? ctx.reply(`${lang[17]} ${lang[28]} ${lang[37]}`)
        : ctx.user.acclvl == 1 ? ctx.reply(`${lang[17]} ${lang[27]} ${lang[37]}`)
        : ctx.user.acclvl == 0 ? ctx.reply(`${lang[17]} ${lang[26]} ${lang[37]}`)
        : ctx.reply(lang[7])
      } else
      if (ctx.cmd === lang[23]) {
          await ctx.scene.leave()
          await ctx.scene.enter('menu')
      }
    }
)

const sceneM = new Scene ('market', 
      async (ctx) => {
        ctx.reply(`Что вы хотели-бы продать?`, null, Markup
            .keyboard([
                [
                  Markup.button(lang[33], 'primary'),
                  Markup.button(lang[34], 'primary'),
                ],
                [
                  Markup.button(lang[35], 'primary'),
                  Markup.button(lang[36], 'primary'),
                ],
                [
                  Markup.button(lang[23], 'negative'),
                ]
            ])
            )
        ctx.scene.next()
      },
      async (ctx) => {
        ctx.session.item = ctx.cmd
        if (ctx.cmd === lang[23] || ctx.cmd === undefined) {
          await ctx.scene.leave()
          await ctx.scene.enter('menu')
        } else {
          ctx.reply(`Сколько ${ctx.cmd} вы хотите продать? Вы так-же можете ввести кол-во вручную`, null, Markup
              .keyboard([
                100,
                500,
                1000
              ])
              .inline()
              )
          ctx.scene.next()
        }
      },
      async (ctx) => {
      ctx.session.count = +ctx.message.text
        if(!Number.isInteger(ctx.session.count)) { return ctx.scene.enter('market') } else {
          if (ctx.session.item === lang[33] ) {
            if (ctx.user.inv.herbs < ctx.session.count) { 
              await ctx.reply(`Недостаточно ${ctx.session.item}`)
              await ctx.scene.enter('menu')
            } else {
              ctx.user.inv.herbs = ctx.user.inv.herbs-ctx.session.count
              ctx.user.balance = ctx.user.balance+ctx.session.count
              await ctx.user.save()
              await ctx.reply(`Вы продали ${ctx.session.count} ${ctx.session.item} и выручили ${ctx.session.count} ${lang[5]}`)
              await ctx.scene.enter('menu')
            }
          }
          if (ctx.session.item === lang[34] ) {
            if (ctx.user.inv.ore < ctx.session.count) { 
              await ctx.reply(`Недостаточно ${ctx.session.item}`)
              await ctx.scene.enter('menu')
            } else {
              ctx.user.inv.ore = ctx.user.inv.ore-ctx.session.count
              ctx.user.balance = ctx.user.balance+ctx.session.count
              await ctx.user.save()
              await ctx.reply(`Вы продали ${ctx.session.count} ${ctx.session.item} и выручили ${ctx.session.count} ${lang[5]}`)
              await ctx.scene.enter('menu')
            }
          }
          if (ctx.session.item === lang[35] ) {
            if (ctx.user.inv.sand < ctx.session.count) { 
              await ctx.reply(`Недостаточно ${ctx.session.item}`)
              await ctx.scene.enter('menu')
            } else {
              ctx.user.inv.sand = ctx.user.inv.sand-ctx.session.count
              ctx.user.balance = ctx.user.balance+ctx.session.count
              await ctx.user.save()
              await ctx.reply(`Вы продали ${ctx.session.count} ${ctx.session.item} и выручили ${ctx.session.count} ${lang[5]}`)
              await ctx.scene.enter('menu')
            }
          }
          if (ctx.session.item === lang[36] ) {
            if (ctx.user.inv.wood < ctx.session.count) { 
              await ctx.reply(`Недостаточно ${ctx.session.item}`)
              await ctx.scene.enter('menu')
            } else {
              ctx.user.inv.wood = ctx.user.inv.wood-ctx.session.count
              ctx.user.balance = ctx.user.balance+ctx.session.count
              await ctx.user.save()
              await ctx.reply(`Вы продали ${ctx.session.count} ${ctx.session.item} и выручили ${ctx.session.count} ${lang[5]}`)
              await ctx.scene.enter('menu')
            }
          }
        }

        ctx.scene.enter('menu')
      }
)

const session = new Session()
const stage = new Stage(scene, sceneJ, sceneS, sceneM)
bot.use(session.middleware())
bot.use(stage.middleware())
}