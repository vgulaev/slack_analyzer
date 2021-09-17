const { SQLTableRow } = require('./sqlTableRow')
const { SQLMetaTable } = require('./sqlMetaTable')

function getName(query) {
  let header = query.split('\n')
  let words = header[0].split(' ')
  return words[2]
}

function getProps(query) {
  let lines = query
    .trim()
    .split('\n')
    .filter((line, indx) => (indx > 0) && (');' != line) )
    .map(line => line.trim().split(' ')[0])
  console.log(lines)
}

exports.SQLTable = class SQLTable {
  static buildClass(query, db) {
    let meta = new SQLMetaTable(query)
    let table = {
      db: db,
      name: meta.name,
      add: (attrs) => {
        return new SQLTableRow(meta, attrs)
      }
    }
    return table
  }

  static assignDBtoSQLTableRow(db) {
    SQLTableRow.db = db
  }
}