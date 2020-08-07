import { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import Page from 'components/Page'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
/*
import LoginIcon from '@material-ui/icons/Lock'
import ExitIcon from '@material-ui/icons/ExitToApp'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
*/
const LoginIcon = () => null
const ExitIcon = () => null
const ChevronRightIcon = () => null

export default function Home({ user }) {
  const [me, setMe] = useState(null)
  const [zohoUrl, setZohoUrl] = useState(null)

  const getMe = async () => {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      setMe(await res.json())
    }
  }

  const getZohoUrl = async (me) => {
    const res = await fetch('/api/zoho/update-token')
    if (res.ok) {
      const { zohoUrl } = await res.json()
      setZohoUrl(zohoUrl)
    }
  }

  useEffect(() => {
    getMe()
  }, [])

  useEffect(() => {
    if (me && me.email_verified) getZohoUrl()
  }, [me])

  return (
    <Page pageTitle='Welcome'>
      <Typography align='center' variant='h2' component='h1' gutterBottom>Apply to attend EA Global</Typography>
      <Grid container spacing={6} justify='center'>
        {me && <Grid item md={6}>
          <Typography gutterBottom>Hey {me.given_name || me.email} ({me.given_name && me.email})!</Typography>
        
          {me && !me.email_verified && <Typography>You need to verify your email! <Link href={window.location.href}>I've done this.</Link></Typography>}
        </Grid>}
        <Grid item md={6}>
          <Grid container spacing={1} justify='center'>
          {!me
            ? <>
                <Grid item xs={12}><Button color='primary' variant='contained' fullWidth href='/api/auth/login'>Login / Sign up <LoginIcon /></Button></Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Log in to your EffectiveAltruism.org account to get started.</Typography>
                  <Typography gutterBottom>
                    If you've ever used <Link href='https://app.effectivealtruism.org/funds'>EA Funds</Link> or
                    taken a Pledge with <Link href='https://www.givingwhatwecan.org'>Giving What We Can</Link>,
                    you already have an account (just sign in using the same details).
                    Otherwise, just sign up for a new account.
                  </Typography>
                </Grid>
              </>
            : <>
                <Grid item xs={12} md={6}><Button variant='contained' fullWidth href='/api/auth/logout'>Logout <ExitIcon /></Button></Grid>
                {zohoUrl  
                  ? <Grid item xs={12} md={6}><Button color='primary' variant='contained' fullWidth href={zohoUrl}>Get Started <ChevronRightIcon /></Button></Grid>
                  : me.email_verified && <CircularProgress />
                }
              </>
          }
          </Grid>
        </Grid>
      </Grid>
      {zohoUrl && <>
        <Divider variant='middle' />
        <Typography>Your Zoho URL is:</Typography>
        <Typography><code>{zohoUrl}</code></Typography>
      </>}
    </Page>
  )
}
