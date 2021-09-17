const { config } = require('../config')
const { WebClient, LogLevel } = require("@slack/web-api");
const { testData } = require('../tmp/testData')

exports.Slack = class Slack {
  constructor(db) {
    this.db = db
    this.client = new WebClient(config.token.slack, {
      logLevel: LogLevel.DEBUG
    })
  }

  fetchAllConversations(cursor) {
    let params = {
      token: config.token.slack,
      types: 'public_channel, private_channel, mpim, im'
    }

    return new Promise((resolve, rej) => {
      let data = []
      // let
      const fetchData = (cursor) => {
        if (cursor) params.cursor = cursor

        this.client.conversations
          .list(params)
          .then(res => {
            data.push(res);
            if (res.response_metadata.next_cursor) {
              fetchData(res.response_metadata.next_cursor);
            } else {
              resolve(data)
            }
          })
          .catch(error => console.log(error));
      }
      fetchData()
    })
  }


  // return new Promise((resolve, rej) => {
  //   let ins = []
  //   testData.channels.forEach(channel => {
  //     let c = this.db.tables.channels.add(channel)
  //     c.raw = JSON.stringify(channel)
  //     ins.push(c.save())
  //   })
  //   Promise.all(ins).then(values => {
  //     resolve()
  //   })
  // })

  pushChannelsToDB() {
    return this.db.tables.channels.truncate().
      then(() => this.fetchAllConversations())
  }
}
