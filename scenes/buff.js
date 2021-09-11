module.exports = async(bot, user, lang) => {
        const timestamp = new Date().getTime()
        //NEWBY BUFF
        if (user[i].buffs.newby <= timestamp) {
            if (user[i].timers.buffNewByAlert) {
                await user[i].set('timers', false, 'buffNewByAlert')
                await user[i].dec('boosters', 1, 'energyCount')
                await user[i].dec('boosters', 1, 'energyRegen')
                await bot.sendMessage(user[i].id, `Действие баффа ${lang.newBy} рассеялось.`)
            }
        } else 
        if (user[i].buffs.newby >= timestamp) {
            if (!user[i].timers.buffNewByAlert) {
                await user[i].set('timers', true, 'buffNewByAlert')
                await user[i].inc('boosters', 1, 'energyCount')
                await user[i].inc('boosters', 1, 'energyRegen')
            }
        }
        //VIP BUFF
        if (user[i].buffs.vip <= timestamp && user[i].acclvl < 5) {
            if (!user[i].timers.buffVipAlert) {
                await user[i].set('timers', true, 'buffVipAlert')
                await user[i].set('acclvl', 0)
                await bot.sendMessage(user[i].id, `Действие баффа ${lang.Vip} рассеялось.`)
            }
        } else 
        if (user[i].buffs.vip >= timestamp && user[i].acclvl < 5) {
            if (user[i].timers.buffVipAlert) {
                await user[i].set('timers', false, 'buffVipAlert')
                await user[i].set('acclvl', 1)
            }
        }
}