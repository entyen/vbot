
const fs = require('fs')
const tea = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
const mongoose = require('mongoose')

mongoose.db.users.aggregate
[
  {
    '$addFields': {
      'inv': {
        'herbs': 0, 
        'rareHerbs': 0
      }
    }
  }
]


mongoose.connect(`mongodb://${tea.DBUSER}:${tea.DBPASS}@${tea.SERVER}/${tea.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.loge('MongoDB connected!!')
}).catch(err => {
    console.errore('Failed to connect to MongoDB', err)
})