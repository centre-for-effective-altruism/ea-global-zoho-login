import auth0 from 'lib/auth0'
import { RETURN_DATA_COOKIE_NAME, cookieOpts } from 'lib/cookie'

export default async function logout(req, res) {
  try {
    res.setHeader('set-cookie', `${RETURN_DATA_COOKIE_NAME}=null; path=${cookieOpts.path}; expires=${new Date(0)}`)
    await auth0.handleLogout(req, res)
  } catch (error) {
    console.error(error)
    res.status(error.status || 400).end(error.message)
  }
}
