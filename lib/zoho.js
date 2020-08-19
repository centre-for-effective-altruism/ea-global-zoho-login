const ZCRMRestClient = require('zcrmsdk')

const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_GRANT_TOKEN, ZOHO_USER_IDENTIFIER, ZOHO_REDIRECT_URL } = process.env

var config = {
  "client_id": ZOHO_CLIENT_ID,//mandatory
  "client_secret": ZOHO_CLIENT_SECRET,//mandatory
  "redirect_url": ZOHO_REDIRECT_URL,//mandatory
  // "user_identifier": ZOHO_USER_IDENTIFIER,
  // "mysql_username": "{mysql_username}",//optional ,"root" is default value
  // "mysql_password": "{mysql_password}",//optional ,"" is default value
  // "base_url": "{api_base_url}",//optional ,"www.zohoapis.com" is default value
  // "iamurl": "{accounts_url}",//optional ,"accounts.zoho.com" is default value
  // "version": "{api_version}",//optional ,"v2" is default value
  "tokenmanagement": 'zoho-postgres-token-management' //optional ,mysql module is default
}

export const init = async () => {
  console.log(`Initializing Zoho client`)
  await ZCRMRestClient.initialize(config)
  return ZCRMRestClient
}

export const getClient = async () => {
  let client = ZCRMRestClient
  // if the client isn't initialized, do so
  if (!client.getClientId()) {
    client = await init()
  }
  return client
}

export const handleRedirectCallback = async ({ code }) => {
  console.log(`Handling Zoho redirect callback`)
  const client = await getClient()
  const tokenRes = await client.generateAuthTokens(null, code)
  return tokenRes
}
