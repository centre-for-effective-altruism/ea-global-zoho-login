const ZCRMRestClient = require('zcrmsdk')
const fs = require('mz/fs')
var path = require('path')
const TOKEN_STORE = path.join(__dirname, 'zcrm_oauthtokens.json')

const saveOAuthTokens = tokenobject => updateOAuthTokens(tokenobject)

const getOAuthTokens = async user_identifier => {
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

updateOAuthTokens = async tokenobject => {
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

module.exports = {
  saveOAuthTokens,
  getOAuthTokens,
  updateOAuthTokens
}
