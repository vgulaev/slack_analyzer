const { SQLTableRow } = require('./sqlTableRow')
const { SQLMetaTable } = require('./sqlMetaTable')

const setClause = (data) => {
  return Object.keys(data).map(k => `${k}='${data[k]}'`).join(',')
}

const whereClause = (where) => {
  return Object.keys(where).map(k => `${k}='${where[k]}'`).join(' and ')
}

exports.SQLTable = class SQLTable {
  static buildClass(query, db) {
    let meta = new SQLMetaTable(query)
    let table = {
      db: db,
      name: meta.name,
      add: (attrs) => {
        return new SQLTableRow(meta, attrs)
      },
      truncate: () => {
        return SQLTable.db.query(`TRUNCATE ${meta.name}`)
      },
      select: () => {
        // return SQLTable.db.query(`SELECT * FROM ${meta.name} WHERE id = 'D02BVBM8P16'`)
        // return SQLTable.db.query(`SELECT * FROM ${meta.name} WHERE name = 'mini360_slack_analyze_debug'`)
        // return SQLTable.db.query(`SELECT * FROM ${meta.name} WHERE name = 'ceomessage'`)
        // return SQLTable.db.query(`SELECT * FROM ${meta.name} WHERE name = 'hr_performance'`)
        return SQLTable.db.query(`SELECT * FROM ${meta.name}`)
      },
      activeChannels: () => {
        let debugChannels = [
          'ceomessage',
          'hr_performance',
          'platform-ops-dev',
          'platform_ops',
          'mini360_slack_analyze_debug'
        ].map(c => `'${c}'`).join(',')
        return SQLTable.db.query(`SELECT * FROM channels WHERE "raw"->>'is_archived' = 'false'
          and name <> 'trading_desk_risks' and name in (${debugChannels})`)
      },
      unparsedMsgs: () => {
        let query = `SELECT id, channel_id, "user", reply_count, subtype, "raw"->>'text' as text, ts, msg_date_time, parsed, "raw"
        FROM public.channel_history
        where "user" is not null and bot_id is null and subtype is null and parsed is null
        order by ts desc`
        return SQLTable.db.query(query)
      },
      ts_last_msg: (channel_id) => {
        let query = `SELECT max(ts) FROM channel_history WHERE channel_id = '${channel_id}'`
        return new Promise((resolve, rej) => {
          SQLTableRow.db.client.query(query, (err, res) => {
            let result
            if (1 == res.rowCount) {
              result = res.rows[0].max
            } else {
              result = err
            }
            return resolve(result)
          })
        })
      },
      update: (where, data) => {
        let query = `UPDATE ${meta.name} SET ${setClause(data)} WHERE ${whereClause(where)}`
        return SQLTable.db.query(query)
      }
    }
    return table
  }

  static assignDBtoSQLTableRow(db) {
    SQLTableRow.db = db
  }
}