const { db } = require('./db')

db.init().then(() => {
  console.log('Slack analyzer');
})
