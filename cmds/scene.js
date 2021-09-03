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
            ctx.reply(lang[1], null, Markup
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
                ],
            ])
            )
        } else {
            ctx.reply(lang[1], null, Markup
                .keyboard([
                    [
                      Markup.button(lang[8], 'primary'),
                    ],
                    [
                      Markup.button(ctx.user.f_name, 'secondary'),
                      Markup.button(lang[3], 'positive'),
                      Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                    ],
                ])
                )
        }
        ctx.scene.leave()
    },

    async (ctx) => {
        ctx.scene.next()
        ctx.reply(lang[6], null, Markup
            .keyboard([
                [
                  Markup.button(lang[6], 'primary'),
                  Markup.button(lang[6], 'primary'),
                ],
            ])
            )
    },

    async (ctx) => {

        await ctx.scene.leave()
        await ctx.reply(`${lang[6]} ${ctx.message.text}`)
        await ctx.scene.enter('menu', [0])
    },

    async (ctx) => {
        ctx.reply('Выбирете направление вашего дальнейшего пути!', null, Markup
            .keyboard([
                [
                  Markup.button(lang[19], 'positive'),
                  Markup.button(lang[21], 'primary'),
                ],
                [
                  Markup.button(lang[22], 'primary'),
                  // Markup.button({
                  //   action: {
                  //     type: 'callback',
                  //     // link: 'https://google.com',
                  //     label: lang[22],
                  //     payload: JSON.stringify({
                  //       button: 'https://google.com',
                  //     }),
                  //   },
                  //   color: 'default',
                  // }),
                  Markup.button(lang[23], 'negative'),
                ]
            ])
            )

        await ctx.scene.next()
    },

    async (ctx) => { 
        const job = ctx.message.payload ? ctx.message.payload.replace(/\"*\{*\}*\:*/g, '').replace('button', '') : ctx.message.payload
        const lvl = ctx.user.level

        if (job === lang[19] && lvl >= 0) {
            // const coldown = Math.ceil((ctx.user.timers.mainWork - ctx.timestamp)/60/1000)
            // if (coldown >= 1) {
            //    await ctx.reply(`Вы устали, ⏳ отдохните ${coldown} минут и возвращайтесь.`)
            //    await ctx.scene.leave()
            //    await ctx.scene.enter('menu', [0])
            // } else {

            if (ctx.user.energy <= 0) {
              await ctx.reply(`Вы устали, у вас ${ctx.user.energy} энергии ⏳ отдохните и возвращайтесь.`)
              await ctx.scene.leave()
              await ctx.scene.enter('menu', [0])
            } else {

            // if (ctx.user.alert) {
            //   bp.delay(10*60*1000).then( () => ctx.reply('Работа снова доступна') )
            // }

            // ctx.user.timers.mainWork = ctx.timestamp + 10 * 60 * 1000
            ctx.user.energy = ctx.user.energy - 1

            const earn = randCurr(5, 20)
            const rare = randCurr(0, 100)

            rare === 77 ? ctx.user.inv.rareHerbs = ctx.user.inv.rareHerbs+1 : null
            ctx.user.inv.herbs = ctx.user.inv.herbs+earn
            ctx.user.exp = ctx.user.exp+1
            await ctx.user.save()

            await ctx.reply(`Вы отыскали немного трав в поле и собрали ${earn} 🌿 ${rare === 77 ? 'и 1 🍀' : ''} у вас еще ${ctx.user.energy} энергии.`)
            }
        } else
        if (job === lang[21] && lvl >= 0) {
          await ctx.reply('Шахта Закрыта')
          //TODO
        } else
        if (job === lang[22] && lvl >= 0) {
          await ctx.reply('Пляж Закрыт')
          //TODO
        } else {
          ctx.scene.leave()
          ctx.scene.enter('menu', [0])
        }
    },
)

const session = new Session()
const stage = new Stage(scene)
bot.use(session.middleware())
bot.use(stage.middleware())
}