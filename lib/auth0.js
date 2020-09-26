import { initAuth0 } from '@auth0/nextjs-auth0'
import { ManagementClient } from 'auth0'
import { getBaseURL } from 'lib/utils'

const {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_COOKIE_SECRET,
  AUTH0_MANAGEMENT_DOMAIN,
  AUTH0_MANAGEMENT_CLIENT_ID,
  AUTH0_MANAGEMENT_CLIENT_SECRET
} = process.env

export default initAuth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
  scope: 'openid profile email',
  redirectUri: `${getBaseURL()}/api/auth/callback`,
  postLogoutRedirectUri: getBaseURL(),
  session: {
    // The secret used to encrypt the cookie.
    cookieSecret: AUTH0_COOKIE_SECRET,
    // The cookie lifetime (expiration) in seconds. Set to 8 hours by default.
    cookieLifetime: 60 * 60 * 8,
    storeAccessToken: true,
  },
})


export const auth0Management = new ManagementClient({
  domain: AUTH0_MANAGEMENT_DOMAIN,
  clientId: AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: AUTH0_MANAGEMENT_CLIENT_SECRET,
  scope: 'read:users update:users'
})
