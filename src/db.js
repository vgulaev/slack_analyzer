const { Client } = require('pg')
const { config } = require('../config')
const { SQLTable } = require('./sqlTable')
const fs = require('fs')

class DB {
  createDB() {
    console.log('createDB')
  }

  dbConnection(dbName) {
    let cred = Object.assign({}, config.postgre)
    cred.database = dbName
    let client = new Client(cred)
    client.connect()
    return client
  }

  checkDBExistanse() {
    return new Promise((resolve, rej) => {
      this
        .adminDBClient
        .query(
          `SELECT datname FROM pg_database where datname = '${config.postgre.database}'`, (err, res) => {
            resolve(0 < res.rowCount)
      })
    })
  }

  createDB() {
    return new Promise((resolve, rej) => {
      this
        .adminDBClient
        .query(
          `CREATE DATABASE ${config.postgre.database}`, (err, res) => {
            this.adminDBClient.end()
            delete this.adminDBClient
            resolve()
          })
    })
  }

  loadTableQueries() {
    let rootPath = './src/SQL/Tables'
    return fs
      .readdirSync(rootPath)
      .map(fileName => fs.readFileSync(`${rootPath}/${fileName}`, 'utf-8'))
  }

  tableQueries() {
    if (!this._tableQueries) {
      this._tableQueries = this.loadTableQueries()
    }
    return this._tableQueries
  }

  createTables() {
    return new Promise((resolve, rej) => {
      let queries = this.tableQueries()
      this.client.query(queries.join('\n'), (err, res) => {
        resolve()
      })
    })
  }

  deleteDBifExist(isDbExists) {
    return new Promise((resolve, rej) => {
      if (!isDbExists) {
        return resolve()
      }
      this.adminDBClient.query(`DROP DATABASE ${config.postgre.database}`, (err, res) => {
        resolve()
      })
    })
  }

  reCreateDB() {
    this.adminDBClient = this.dbConnection('postgres');
    return new Promise((resolve, rej) => {
      this.checkDBExistanse().then((isDbExists) => {
        return this.deleteDBifExist(isDbExists);
      })
      .then(() => {
        let p = this.createDB()
        return p
      })
      .then(() => {
        this.client = this.dbConnection(config.postgre.database)
        return this.createTables()
      })
      .then(() => {
        resolve(this)
      })
    })
  }

  constructTableRowObjectsFromTableQueries() {
    this.tables = {}
    this.tableQueries().forEach(query => {
      let metaClass = SQLTable.buildClass(query, this)
      this.tables[metaClass.name] = metaClass
    })
  }

  init({ ...params } = {}) {
    this.constructTableRowObjectsFromTableQueries()
    return new Promise((resolve, rej) => {
      if (params.skipRecreation) {
        this.client = this.dbConnection(config.postgre.database)
        return resolve(this)
      } else {
        this.reCreateDB().then(() => resolve())
      }
    })
  }

  end() {
    this.client.end()
  }

}

const db = new DB()

SQLTable.db = db
SQLTable.assignDBtoSQLTableRow(db)

exports.db = db
