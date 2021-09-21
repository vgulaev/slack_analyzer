exports.HistoryParser = class HistoryParser {
  constructor(db) {
    this.db = db
  }

  extractMentions(text) {
    let users = text.split('<@')
    users.shift()
    return users.map(u => u.split('>')[0])
  }

  parseSingleText(row) {
    let mentions = this.extractMentions(row.text)
    let queries = mentions.map(m => {
      let newMention = this.db.tables.mentions.add({
        msg_id: row.id,
        user: row.user,
        mention: m,
        ts: row.ts,
        msg_date_time: row.msg_date_time
      })
      return newMention.save()
    })
    queries.push(this.db.tables.channel_history.update({id: row.id}, {parsed: 1}))
    return Promise.all(queries)
    // return Promise.resolve()
  }

  parse() {
    return this.db.tables.channel_history.unparsedMsgs()
      .then((res) => {
        if (0 == res.res.rowCount) {
          let msg = 'nothing to parse'
          console.log(msg)
          return Promise.resolve(msg)
        }
        return res.res.rows.reduce((p, row) => {
          return p.then(() => this.parseSingleText(row))
        }, Promise.resolve())
      })
  }
}
