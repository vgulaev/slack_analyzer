class SQLTableRow {
  constructor(meta, attrs) {
    this.meta = {
      name: meta.name,
      props: meta.props
    }
    Object.assign(this, meta.blankObject)
    this.meta.props.forEach(prop => {
      if (attrs[prop]) {
        this[prop] = attrs[prop]
      }
    })
  }

  insertQuery() {
    let obj = {}
    this.meta.props.forEach(prop => {
      if (this[prop]) {
        obj[prop] = this[prop]
      }
    })
    let keys = Object.keys(obj)
    return {
      sql: `INSERT INTO ${this.meta.name} (${keys.map(k => `"${k}"`).join(',')}) VALUES(${keys.map((k, i) => `$${i+1}`)})`,
      val: keys.map(k => obj[k])
    }
  }

  save() {
    let query = this.insertQuery()
    return new Promise((resolve, rej) => {
      SQLTableRow.db.client.query(query.sql, query.val, (err, res) => {
        let result = false
        if (res) {
          result = (1 == res.rowCount)
        } else {
          result = err
        }
        resolve(result)
      })
    })
  }
}

exports.SQLTableRow = SQLTableRow
