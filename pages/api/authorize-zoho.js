import auth0 from 'lib/auth0'
import uuid from 'uuid-random'
import url from 'url'

const LOGIN_URL_BASE = 'https://creator.zoho.com'

const updateZohoContactWithToken = async ({ email, token }) => {
  // fake waiting for API call - replace with actual thing
  await new Promise(r => setTimeout(r, 2000))
  const zohoUrl = url.parse(LOGIN_URL_BASE)
  zohoUrl.query = { email, token }
  return { zohoUrl: url.format(zohoUrl) }
}

export default auth0.requireAuthentication(async function authorizeZoho (req, res) {
  try {
    const { user } = await auth0.getSession(req)
    const { email, email_verified } = user
    if (!email_verified) throw new Error('User email is not verified!')
    const token = uuid()
    const { zohoUrl } = await updateZohoContactWithToken({ email, token })
    res.json({ email, token, zohoUrl })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
})
