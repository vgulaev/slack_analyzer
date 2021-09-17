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
      }
    }
    return table
  }

  static assignDBtoSQLTableRow(db) {
    SQLTableRow.db = db
  }
}