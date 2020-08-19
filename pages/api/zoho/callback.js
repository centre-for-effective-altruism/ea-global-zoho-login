import { handleRedirectCallback } from 'lib/zoho'

export default async function callback (req, res) {
  const code = req.query.code
  await handleRedirectCallback({ code })
  res.writeHead(302, { location: '/' }).end()
}
