import auth0 from 'lib/auth0'
import { getClient } from 'lib/zoho'
import uuid from 'uuid-random'

const zohoRes = res => {
  // if the body is empty, it probably means there was no record returned
  if (!res.body) {
    try {
      res = JSON.parse(res)
    } catch (err) {
      console.error(`response is not valid JSON`)
    }
    const { message, status_code } = res
    // 204 means that we made an OK request, but there was no data to return
    if (status_code.toString() === '204') return []
    // otherwise, assume it's an error and throw
    // if we have a message, throw with that
    if (message) {
      const err = new Error(res.message)
      if (status_code) err.status_code = status_code
      throw err
    }
    // if we get here, we're in uncharted territory...
    console.log(res)
    throw new Error('Unknown error')
  }
  const body = JSON.parse(res.body)
  // error handling
  if (res.statusCode > 299) {
    if (body.data) {
      for (const item of body.data) {
        console.error(`${item.code}: ${item.message}`)
        console.error(item.details)
      }
      throw new Error('API error')
    }
    const err = new Error(body.message || body)
    if (typeof body === 'object') {
      for (const key in body) {
        err[key] = body[key]
        throw err
      }
    }
  }
  if (!body.data) {
    console.log(body)
    return []
  }
  return body.data
}

const zohoResSingle = res => zohoRes(res)[0]

const doUpdateZohoContactWithToken = async ({ id, token }) => {
  const client = await getClient()
  console.log(`Updating contact ${id} with token ${token.replace(/\w{4}-\w{4}-\w{4}-\w{4}-\w{8}/,'...')}`)
  return client.API.MODULES.put({
    module: 'Contacts',
    id,
    body: {
      data: [{
        Auth_Token_UUID: token
      }],
      trigger: []
    }
  }).then(zohoResSingle)
}

const createZohoContactWithToken = async ({ email, token }) => {
  console.log(`Creating Zoho contact with email ${email}`)
  const client = await getClient()
  const updateReq = await client.API.MODULES.post({
    module: 'Contacts',
    body: {
      data: [{
        Email: email,
        Last_Name: '-',
        Auth_Token_UUID: token
      }],
      trigger: [] // TODO: unsure if this is correct behaviour, check with Kashif
    }
  }).then(zohoResSingle)
  if (updateReq.status === 'success') return true
  // if we got here, there's been an error
  // one error case is a duplicate, which we can easily handle...
  if (updateReq.code === 'DUPLICATE_DATA') {
    console.log(`Found a duplicate, updating instead...`)
    const { id } = updateReq.details
    await doUpdateZohoContactWithToken({ id, token })
    return true
  }
  throw new Error(updateReq.message)
}

const updateZohoContactWithToken = async ({ email, token }) => {
  const client = await getClient()
  // find the contact based on email
  console.log(`Searching for Zoho contact with email ${email}`)
  const Contact = await client.API.MODULES.search({
    module: 'Contacts',
    params: { email }
  }).then(zohoResSingle)
  // fallback to creating the contact
  if (!Contact) return createZohoContactWithToken({ email, token })
  // update the contact record with token
  const updateReq = await doUpdateZohoContactWithToken({ id: Contact.id, token })
  if (updateReq.status !== 'success') throw new Error(updateReq.message)
  return true
}

export default auth0.requireAuthentication(async function authorizeZoho (req, res) {
  try {
    const { user } = await auth0.getSession(req)
    const { email, email_verified } = user
    if (!email_verified) throw new Error('User email is not verified!')
    const token = uuid()
    try {
      await updateZohoContactWithToken({ email, token })
    } catch (err) {
      if (err.status_code === 204) await createZohoContactWithToken({ email, token })
      throw err
    }
    // If the user has the `use registration` cookie set, direct them to the application form,
    // otherwise send them to the registration form
    res.json({ email, token })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
})
