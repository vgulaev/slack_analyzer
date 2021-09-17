const { db } = require('./db')
const { Slack } = require('./slack')

// db.init().then(() => {
db.init({ skipRecreation: true }).then((db) => {
  let slack = new Slack(db)
  // slack.pushChannelsToDB()
  // console.log(db.tables.channels)
  let row1 = db.tables.channels.add()
  let row2 = db.tables.channels.add()
  row1.id = 'dsaasdas'
  row2.id = 'erewrerw'

  console.log(row1, row2);
  db.end()
})
