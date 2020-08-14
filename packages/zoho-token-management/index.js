const ZCRMRestClient = require('zcrmsdk')
const fs = require('mz/fs')
var path = require('path')
const TOKEN_STORE = path.join(__dirname, 'zcrm_oauthtokens.json')

const localFile = {}
const db = {}
localFile.saveOAuthTokens = tokenobject => updateOAuthTokens(tokenobject)

localFile.getOAuthTokens = async user_identifier => {
  try {
    const filedata = await fs.readFile(TOKEN_STORE).then(buf => buf.toString())
    const tokens = JSON.parse(filedata)
    if (!tokens || !tokens.length) return
    for (token of tokens) {
      if (token.user_identifier === user_identifier) {
        return token
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') return {}
    throw err
  }
}

localFile.updateOAuthTokens = async tokenobject => {
  let tokens
  try {
    // check if we have any existing tokens in the store
    const filedata = fs.readFileSync(TOKEN_STORE, 'utf8');
    existingTokens = JSON.parse(filedata) || []
    // add any tokens that don't match the incoming token
    const userIdentifier = ZCRMRestClient.getUserIdentifier()
    console.log('User identifier', userIdentifier)
    if (existingTokens.length) {
      tokens = []
      for (const t of existingTokens) {
        if (t.user_identifier === ZCRMRestClient.getUserIdentifier()) {
          tokens.push({ ...t, ...tokenobject })
        } else {
          tokens.push(t)
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    // presumably we got here because we don't have a file
    tokens = [tokenobject]
  }
  // save the file
  console.log(`Saving ${tokens.length} tokens to the store...`)
  await fs.writeFile(TOKEN_STORE, JSON.stringify(tokens, null, 2))
}


const initOptions = {/* initialization options */};
const pgp = require('pg-promise')(initOptions);
const {ParameterizedQuery: PQ} = require('pg-promise');
const { DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env
const connection = {
  host: DB_HOST,
  port: DB_PORT || 5432,
  database: DB_DATABASE,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync(path.join(__dirname, 'db', 'rds-ca-2019-root.pem')).toString()
  }
}
const pg = pgp(connection);
db.saveOAuthTokens = tokenobject => db.updateOAuthTokens(tokenobject)

db.getOAuthTokens = async user_identifier => {
  const findToken = new PQ({text: 'select * from auth where user_identifier = $1', values: [user_identifier]})
  const token = await pg.one(findToken)
  return token
}

db.updateOAuthTokens = async tokenobject => {
  const userIdentifier = ZCRMRestClient.getUserIdentifier()
  const {access_token, refresh_token, expires_in } = tokenobject
  const updateToken = new PQ({text: `
    insert into auth(access_token, refresh_token, expires_in, user_identifier)
    values ($1, $2, $3, $4)
    on conflict (user_identifier)
      do update set (access_token, expires_in) = (EXCLUDED.access_token, EXCLUDED.expires_in)`,
  values: [access_token, refresh_token, expires_in, userIdentifier]})
  await pg.none(updateToken)
}

module.exports = {
  ...db
}
