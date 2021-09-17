const { Client } = require('pg')
const { config } = require('../config')

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

  constructor() {
    this.adminDBClient = this.dbConnection('postgres');
    // this.dbClient = this.dbConnection(config.postgre.database);
  }

  createDB() {
    return new Promise((resolve, rej) => {
      this
        .adminDBClient
        .query(
          `CREATE DATABASE ${config.postgre.database}`, (err, res) => {
            resolve()
          })
    })
  }

  createTables() {
    console.log('createTables')
  }

  deleteDBifExist(is_DbExists) {
    return new Promise((resolve, rej) => {
      if (!is_DbExists) {
        console.log('db not exist')
        resolve()
        return
      }
      console.log('Should be delete DB')
      resolve()
    })
  }

  init() {
    this.checkDBExistanse().then(
      (is_DbExists) => {
        return this.deleteDBifExist(is_DbExists);
      }
    )
    .then(() => {
      let p = this.createDB()
      this.adminDBClient.end()
      delete this.adminDBClient
      return p
    })
    .then(() => {
      this.createTables()
    })
  }
}

exports.db = new DB();