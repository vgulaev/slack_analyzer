const { Client } = require('pg')
const { config } = require('../config')
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

  constructor() {
    this.adminDBClient = this.dbConnection('postgres');
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

  createTables() {
    return new Promise((resolve, rej) => {
      let queries = this.loadTableQueries()
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

  init() {
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
        this.client.end()
        resolve()
      })
    })
  }
}

exports.db = new DB()