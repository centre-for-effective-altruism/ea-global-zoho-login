const fs = require('mz/fs')
var path = require('path')
const TOKEN_STORE = path.join(__dirname, 'zcrm_oauthtokens.txt')

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
    if (err.code === 'ENOENT') {
      console.warn(`getOAuthTokens(): Token file not found...`)
      return {}
    }
    console.error(err)
  }
}

updateOAuthTokens = async tokenobject => {
  console.log(`Updating token store with token`, tokenobject)
    let tokens
    try {
      // check if we have any existing tokens in the store
      const filedata = fs.readFileSync(TOKEN_STORE, 'utf8');
      existingTokens = JSON.parse(filedata) || []
      // add any tokens that don't match the incoming token
      tokens = existingTokens.filter(t => t.user_identifier !== tokenobject.user_identifier)
      tokens.unshift(tokenobject)
    } catch (err) {
      if (err.code === 'ENOENT') console.warn('updateOAuthTokens(): Token file does not exist...')
      else console.error(err)
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
