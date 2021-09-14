const { Client } = require('pg')

const client = new Client()
await client.connect()

const client = new Client()
client.connect()

class DB {
  constructor() {
    this.client = new Client({
      user: 'dbuser',
      host: 'database.server.com',
      database: 'mydb',
      password: 'secretpassword',
      port: 5432,
    })
    console.log('DB created')
  }
}

exports.db = new DB();