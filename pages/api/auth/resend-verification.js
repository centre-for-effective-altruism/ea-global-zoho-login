import auth0, { auth0Management } from 'lib/auth0'

export default async function me(req, res) {
  try {
    const session = await auth0.getSession(req)
    if (!session || !session.user) throw new Error('User is not logged in')
    const { user } = session
    await auth0Management.sendEmailVerification({ user_id: user.sub })
    console.log(`Sent verification email for ${user.sub}`)
    res.status(200).end()
  } catch (err) {
    console.error(err)
    const { error, description } = err
    if (error && description) {
      return res.status(500).end(description)
    }
    res.status(error.status || 500).end(error.message)
  }
}
