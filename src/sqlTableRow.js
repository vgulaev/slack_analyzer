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
    let values = keys.map(k => 'raw' == k ? `$VG$${obj[k]}$VG$`: `'${obj[k]}'`).join(',')
    return `INSERT INTO ${this.meta.name} (${keys.join(',')}) VALUES(${values})`
  }

  save() {
    let query = this.insertQuery()
    return new Promise((resolve, rej) => {
      SQLTableRow.db.client.query(query, (err, res) => {
        let result = false
        if (res) {
          result = (1 == res.rowCount)
        } else {
          result = err
          // console.log(this.raw)
          // exit()
        }
        resolve(result)
      })
    })
  }
}

exports.SQLTableRow = SQLTableRow
