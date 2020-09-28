import url from 'url'
import { getBaseURL } from 'lib/utils'

const { ZOHO_CLIENT_ID } = process.env
const ZOHO_OAUTH_URL_BASE = 'https://accounts.zoho.com/oauth/v2/auth'

const getZohoURL = () => {
  const zohoUrl = url.parse(ZOHO_OAUTH_URL_BASE, true)
  delete zohoUrl.search
  zohoUrl.query = {
    ...zohoUrl.query,
    scope: 'ZohoCRM.modules.contacts.ALL',
    client_id: ZOHO_CLIENT_ID,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    redirect_uri: getBaseURL()
  }
  return url.format(zohoUrl)
}

export default async function authorizeZoho (req, res) {
  const zohoUrl = getZohoURL()
  console.log(`Redirecting to ${zohoUrl}`)
  res.writeHead(302, { location: zohoUrl }).end()
}
