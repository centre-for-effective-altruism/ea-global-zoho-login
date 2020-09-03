import auth0 from 'lib/auth0';

export default async function login(req, res) {
  try {
    await auth0.handleLogin(req, res, {
      authParams: {
        screen_hint: 'signup'
      }
    })
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).end(error.message);
  }
}
