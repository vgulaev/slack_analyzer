const { db } = require('./db')
const { Slack } = require('./slack')

// db.init().then(() => {
db.init({ skipRecreation: true }).then((db) => {
  let slack = new Slack(db)
  return slack.pushChannelsToDB()
  //db.end()
})
  .then((data) => {
    console.log(data)
    db.end()
  })
