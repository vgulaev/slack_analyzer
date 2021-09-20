const { db } = require('./db')
const { Slack } = require('./slack')

let slack;

db.init({ skipRecreation: true })
  .then((db) => {
    slack = new Slack(db)
    return Promise.resolve(slack)
  })
  // .then(() => {
  //   return slack.pushChannelsToDB()
  // })
  .then((res) => {
    return slack.fetchHistory()
  })
  .then((data) => {
    console.log('***', data)
    db.end()
  })
