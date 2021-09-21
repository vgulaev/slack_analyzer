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
    })
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
          fs.writeFileSync(`./tmp/res-${dateToSQLFormat(new Date).replace(/:/g, '-')} - ${channel.id} - ${params.oldest}.json`, JSON.stringify(res, null, 2), 'utf-8')
          if (!((true == res.ok) && (res.messages.length > 0))) {
            return []
          }
          return res.messages
        })
        .then(msgs => {
          let rows = msgs.map(msg => {
            let row = this.db.tables.channel_history.add(msg)
            row.channel_id = channel.id
            row.msg_date_time = dateToSQLFormat(new Date(msg.ts * 1000))
            row.raw = JSON.stringify(msg)
            return row
          })
          this.saveOneByOne(rows)
          console.log(`${rows.length} msg loaded`)
          if (rows.length > 0) {
            let max = msgs.map(msg => msg.ts).sort()[rows.length - 1]
            params.oldest = max
            return fetchData()
          }
        })
        .catch(err => {
          if (err.data && 'not_in_channel' == err.data.error) {
            return this.joinToChannel(channel)
              .then(fetchData())
              .catch(err => console.log(err))
          } else {
            console.log(err)
          }
        })
    }
    return fetchData()
  }

  fetchHistory() {
    let channel

    const fetchData = (channel) => {
      return this.db.tables.channels.ts_last_msg(channel.id)
        .then((oldestFromDb) => {
          return this.fetchHistoryForSingleChannel(channel, oldestFromDb)
            .then(() => this.db.tables.channels.update({id: channel.id}, {history_retrieved: dateToSQLFormat(new Date)}))
        })
    }

    return this.db.tables.channels.activeChannels()
      .then((res) => {
        return res.res.rows.reduce((p, channel) => {
          return p.then(() => fetchData(channel))
        }, Promise.resolve())
      })
  }

  manyRequests() {
    console.log('manyRequests')
    for (let i = 0; i < 200; i++) {
      this.client.conversations.history({
        channel: 'C61QSMX6E',
        limit: 10
      })
      .then((res) => {
        console.log('******************')
        return res.messages
      })
      console.log(i)
    }
  }
}
