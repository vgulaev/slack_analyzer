const { db } = require('./db')
const { Slack } = require('./slack')
const { HistoryParser } = require('./history_parser')

let slack, hsp;

db.init({ skipRecreation: true })
  .then((db) => {
    slack = new Slack(db)
    hsp = new HistoryParser(db)
    return Promise.resolve(slack)
  })
  // .then(() => {
  //   return slack.pushChannelsToDB()
  // })
  // .then(() => {
  //   return db.tables.users.truncate()
  //     .then(() => slack.pushUsersToDB())
  //   // return slack.pushUsersToDB()
  // })
  // .then(() => {
  //   return slack.fetchHistory()
  // })
  // .then((res) => {
  //   return slack.manyRequests()
  // })
  .then(() => {
    return hsp.parse()
  })
  .then((data) => {
    db.end()
  })
