function getName(lines) {
  let words = lines[0].split(' ')
  return words[2]
}

function getProps(lines) {
  return lines
    .filter((line, indx) => (indx > 0) && (');' != line) )
    .map(line => line.trim().split(' ')[0]).map(line => line.replace(/"/g, ''))
}

exports.SQLMetaTable = class SQLMetaTable {
  constructor(query) {
    let splited = query.trim().split('\n')
    this.name = getName(splited)
    this.props = getProps(splited)
    this.blankObject = {}
    this.props.forEach(prop => this.blankObject[prop] = undefined)
  }
}