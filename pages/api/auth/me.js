import auth0 from 'lib/auth0'

export default async function me(req, res) {
  try {
    await auth0.handleProfile(req, res)
  } catch (err) {
    console.error(err)
    const { error, description } = err
    if (error && description) {
      return res.status(500).end(description)
    }
    res.status(error.status || 500).end(error.message)
  }
}
