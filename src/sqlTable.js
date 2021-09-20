const { SQLTableRow } = require('./sqlTableRow')
const { SQLMetaTable } = require('./sqlMetaTable')

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
        return SQLTable.db.query(`SELECT * FROM ${meta.name} WHERE name = 'hr_performance'`)
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
      }
    }
    return table
  }

  static assignDBtoSQLTableRow(db) {
    SQLTableRow.db = db
  }
}