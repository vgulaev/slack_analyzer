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

  conversationsList(cursor) {
    // let params = {
    //   token: config.token.slack,
    //   types: 'public_channel, private_channel, mpim, im'
    // }

    // if (cursor) params.cursor = cursor

    // client.conversations
    //   .list(params)
    //   .then(data => {
    //     channels.push(...data.channels);
    //     if (data.response_metadata.next_cursor) {
    //       // this.conversationsList(data.response_metadata.next_cursor);
    //     } else {
    //       // parseChanels()
    //     }
    //   })
    //   .catch(error => console.log(error));
  }

  pushChannelsToDB() {
    return new Promise((resolve, rej) => {
      let ins = []
      testData.channels.forEach(channel => {
        let c = this.db.tables.channels.add(channel)
        c.raw = JSON.stringify(channel)
        ins.push(c.save())
      })
      Promise.all(ins).then(values => {
        resolve()
      })
    })
  }
}
