const { config } = require('../config')
const { WebClient, LogLevel } = require("@slack/web-api");
const { testData } = require('../tmp/testData')
const { dateToSQLFormat } = require('./utils')
const fs = require('fs')

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

  saveOneByOne(rows) {
    return Promise.all(rows.map(row => row.save()))
  }

  inserChannelsToDB(data) {
    let rows = data.map(res => {
      return res.channels.map(channel => {
        let row = this.db.tables.channels.add(channel)
        row.raw = JSON.stringify(channel)
        return row
      })
    }).flat()
    return this.saveOneByOne(rows)
  }

  pushChannelsToDB() {
    return this.db.tables.channels.truncate()
      .then(() => this.fetchAllConversations())
      // .then(() => Promise.resolve(JSON.parse(fs.readFileSync('./tmp/conv.json', 'utf-8'))))
      .then((data) => this.inserChannelsToDB(data))
      .then(() => {
        return Promise.resolve('ok')
      })
  }

  joinToChannel(channel) {
    return this.client.conversations.join({
      channel: channel.id
      // users: 'U019PGXKZ7C'
    })
      .then((res) => {
        console.log('Here Im');
        return Promise.resolve()
      })
      .catch(err => console.log(err))
    // app.client.conversations.invite
    // console.log('should join')
    // return Promise.resolve()
  }

  fetchHistoryForSingleChannel(channel, oldestFromDb) {
    let params = {
      channel: channel.id,
    }

    if (oldestFromDb) {
      params.oldest = oldestFromDb
    } else {
      params.oldest = (new Date(2021, 8, 13)) / 1000
    }

    const fetchData = () => {
      return this.client.conversations.history(params)
        .then((res) => {
          if (!((true == res.ok) && (res.messages.length > 0))) {
            return Promise.resolve([])
          }
          return Promise.resolve(res.messages)
        })
        .then(msgs => {
          let rows = msgs.map(msg => {
            let row = this.db.tables.channel_history.add(msg)
            row.channel_id = channel.id
            row.user_id = msg.user
            row.reply_count = msg.reply_count
            row.msg_date_time = dateToSQLFormat(new Date(msg.ts * 1000))
            row.raw = JSON.stringify(msg)
            return row
          })
          this.saveOneByOne(rows)
          if (rows.length > 0) {
            let max = msgs.map(msg => msg.ts).sort()[rows.length - 1]
            params.oldest = max
            console.log(msgs.map(msg => msg.ts), max, rows.length)
            return fetchData()
          }
        })
        .catch(err => {
          if (err.data && 'not_in_channel' == err.data.error) {
            return this.joinToChannel(channel)
          } else {
            console.log(err)
          }
        })
    }
    return fetchData()
  }

  fetchHistory() {
    let channel
    return this.db.tables.channel_history.truncate()
      .then(() => this.db.tables.channels.select())
    // return this.db.tables.channels.select()
      .then((res) => {
        // console.log(res)
        channel = res.res.rows[0]
        return this.db.tables.channels.ts_last_msg(res.res.rows[0].id)
      })
      .then((oldestFromDb) => {
        return this.fetchHistoryForSingleChannel(channel, oldestFromDb)
          //.then(() => db.tables.channels.update())
      })

    // console.log('fetchHistory')
  }
}
