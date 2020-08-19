import { initAuth0 } from '@auth0/nextjs-auth0'

const {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_REDIRECT_URI,
  AUTH0_COOKIE_SECRET
} = process.env

export default initAuth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
  scope: 'openid profile email',
  redirectUri: `${AUTH0_REDIRECT_URI}/api/auth/callback`,
  postLogoutRedirectUri: 'https://eaglobal.org',
  session: {
    // The secret used to encrypt the cookie.
    cookieSecret: AUTH0_COOKIE_SECRET,
    // The cookie lifetime (expiration) in seconds. Set to 8 hours by default.
    cookieLifetime: 60 * 60 * 8,
    storeAccessToken: true
  }
})
