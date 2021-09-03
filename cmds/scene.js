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
                ],
                [
                  Markup.button(ctx.user.f_name, 'secondary'),
                  Markup.button(lang[3], 'positive'),
                  Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                ],
                [
                  Markup.button(`${ctx.user.acclvl == 7 ? lang[11]: ctx.user.acclvl == 6 ? lang[10] : ctx.user.acclvl == 5 ? lang[9] : ctx.user.acclvl }`, 'negative'),
                  Markup.button(`${lang[29]}`, 'secondary'),
                ],
            ])
            )
        } else {
            await ctx.reply(lang[1], null, Markup
                .keyboard([
                    [
                      Markup.button(lang[8], 'primary'),
                    ],
                    [
                      Markup.button(ctx.user.f_name, 'secondary'),
                      Markup.button(lang[3], 'positive'),
                      Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                    ],
                    [
                      Markup.button(`${ctx.user.acclvl == 0 ? lang[26]: ctx.user.acclvl == 1 ? lang[27] : ctx.user.acclvl == 2 ? lang[28] : ctx.user.acclvl }`, 'secondary'),
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

const scene0 = new Scene('job', 
    async (ctx) => {
        ctx.reply('Выбирете направление вашего дальнейшего пути!', null, Markup
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
        const job = ctx.message.payload ? ctx.message.payload.replace(/["{}:]/g, '').replace('button', '') : ctx.message.payload
        const lvl = ctx.user.level
        const lvlx = ctx.user.level <=0 ? 1 : 1 + (ctx.user.level*0.2)

        if (job === lang[19] && lvl >= 0) {
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

            let earn = randCurr(5, 20)
            const rare = randCurr(0, 200)
            earn = Math.round(earn*lvlx)

            rare === 27 ? ctx.user.inv.rareHerbs = ctx.user.inv.rareHerbs+1 : null
            ctx.user.inv.herbs = ctx.user.inv.herbs+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 27 ? 'и 1 🍀' : ''} у вас еще ${ctx.user.energy} энергии.`)
            }
        } else
        if (job === lang[21] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

            ctx.user.energy = ctx.user.energy - 1

            let earn = randCurr(2, 14)
            const rare = randCurr(0, 400)
            earn = Math.round(earn*lvlx)

            rare === 277 ? ctx.user.inv.rareOre = ctx.user.inv.rareOre+1 : null
            ctx.user.inv.ore = ctx.user.inv.ore+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы направились в горную шахту и добыли ${earn} ⛰ ${rare === 277 ? 'и 1 💎' : ''} у вас еще ${ctx.user.energy} энергии.`)
            }
        } else
        if (job === lang[22] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

            ctx.user.energy = ctx.user.energy - 1

            let earn = randCurr(20, 100)
            earn = Math.round(earn*lvlx)

            ctx.user.inv.sand = ctx.user.inv.sand+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы направились на пляж и откопали ${earn} 🏝 у вас еще ${ctx.user.energy} энергии.`)
            }
        } else
        if (job === lang[24] && lvl >= 0) {
            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

            ctx.user.energy = ctx.user.energy - 1

            let earn = randCurr(13, 50)
            earn = Math.round(earn*lvlx)

            ctx.user.inv.wood = ctx.user.inv.wood+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы направились в лес и нарубили ${earn} 🌲 у вас еще ${ctx.user.energy} энергии.`)
            }
        } else
        if (job === lang[25] && lvl >= 0) {
          if (lvl <= 4) {
            await ctx.reply(`Протите но рыбалка доступна с 4 уровня.`)
          } else {
            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
            } else {

            ctx.user.energy = ctx.user.energy - 1

            let earn = randCurr(0, 0)
            earn = Math.round(earn*lvlx)

            // ctx.user.inv.wood = ctx.user.inv.wood+earn
            // ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы направились в лес и нарубили ${earn} 🌲 у вас еще ${ctx.user.energy} энергии.`)
            }
          }
        } else {
          await ctx.scene.leave()
          await ctx.scene.enter('menu', [0])
        }
    },
)

const session = new Session()
const stage = new Stage(scene, scene0)
bot.use(session.middleware())
bot.use(stage.middleware())
}