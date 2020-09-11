const { NODE_ENV } = process.env

export const USE_APPLICATION_COOKIE_NAME='eag_use_application'

export const cookieOpts = {
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
  sameSite: 'lax',
  secure: NODE_ENV !== 'development'
}
