import { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import Page from 'components/Page'
import Alert from '@material-ui/lab/Alert'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/styles'
/*
import LoginIcon from '@material-ui/icons/Lock'
import ExitIcon from '@material-ui/icons/ExitToApp'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
*/
const LoginIcon = () => null
const ExitIcon = () => null
const ChevronRightIcon = () => null

const useStylesSpacer = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(2)
  }
}))

const Spacer = () => {
  const classes = useStylesSpacer()
  return <div className={classes.root} />
}

const LoadingState = () => <CircularProgress />

const LoggedOutState = () => <>
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <Button color='primary' variant='contained' fullWidth href='/api/auth/login'>
        Login <LoginIcon />
      </Button>
    </Grid>
    <Grid item xs={12} sm={6}>
      <Button variant='contained' fullWidth href='/api/auth/signup'>
        Sign Up <LoginIcon />
      </Button>
    </Grid>
  </Grid>
  <Spacer />
  <Typography gutterBottom>Log in to your EffectiveAltruism.org account to get started.</Typography>
  <Typography gutterBottom>
    If you've ever used <Link href='https://app.effectivealtruism.org/funds'>EA Funds</Link> or
    taken a Pledge with <Link href='https://www.givingwhatwecan.org'>Giving What We Can</Link>,
    you already have an account (just sign in using the same details).
    Otherwise, just sign up for a new account.
  </Typography>
</>

const LoggedInState = ({ me, classes, resendVerificationEmail, verificationResendStatus, zohoUrl }) => <>
  <Typography gutterBottom>Hey <strong>{me.given_name || me.email}{me.given_name && ` (${me.email})`}</strong>!</Typography>

  {!me.email_verified
    ? <>
      <Typography gutterBottom>Thanks for signing in. You'll just need to verify your email!</Typography>
      <Spacer />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant='contained' color='primary' href={window.location.href}>I've done this</Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant='contained' onClick={resendVerificationEmail}>Resend verification email</Button>
        </Grid>
      </Grid>
      {verificationResendStatus.message && <Alert severity={verificationResendStatus.status}>
        {verificationResendStatus.message}
      </Alert>}
    </>
    : <>
      {!zohoUrl
        ? <>
          <Alert severity='info'>Hang on a second, we're just getting the system ready... <CircularProgress size='1rem' /></Alert>
        </>
        : <Typography>If you're ready to start your application, click 'Get Started'.</Typography>
      }
      <Spacer />
      <Grid container spacing={2} justify='center'>
        <Grid item xs={12} md={6}>
          <Button color='primary' variant='contained' fullWidth href={zohoUrl} disabled={!zohoUrl}>
            Get Started <ChevronRightIcon />
          </Button>
        </Grid>
      </Grid>
      <Spacer />
      <Link href='/api/auth/logout'>Logout <ExitIcon /></Link>
    </>
  }
</>

const useStyles = makeStyles(theme => ({
  wrapper: {
    textAlign: 'center'
  }
}))

export default function Home({ user }) {
  const [loginChecked, setLoginChecked] = useState(false)
  const [me, setMe] = useState(null)
  const [zohoUrl, setZohoUrl] = useState(null)
  const [verificationResendStatus, setVerificationResendStatus] = useState({ message: null, state: null})

  const getMe = async () => {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      setMe(await res.json())
    }
    setLoginChecked(true)
  }

  const getZohoUrl = async (me) => {
    const res = await fetch('/api/zoho/update-token')
    if (res.ok) {
      const { zohoUrl } = await res.json()
      setZohoUrl(zohoUrl)
    }
  }

  const resendVerificationEmail = async () => {
    await setVerificationResendStatus({ message: 'Resending verification email', status: 'info' })
    try {
      const res = await fetch('/api/auth/resend-verification')
      if (res.ok) {
        await setVerificationResendStatus({ message: 'Verification email sent', status: 'success' })
      } else {
        await setVerificationResendStatus({ message: 'Error sending verification email', status: 'error' })
      }
    } catch (err) {
      await setVerificationResendStatus({ message: err.message, status: 'error' })
    }
  }

  useEffect(() => {
    getMe()
  }, [])

  useEffect(() => {
    if (me && me.email_verified) getZohoUrl()
  }, [me])

  const classes = useStyles()

  return (
    <Page pageTitle='Welcome'>
      <div className={classes.wrapper}>
        <Grid container justify='center'>
          <Grid item sm={8} md={6}>
            <Typography align='center' variant='h2' component='h1' gutterBottom>Apply to attend the EA Student Summit</Typography>
            {loginChecked
              ? me
                ? <LoggedInState {...{ me, resendVerificationEmail, verificationResendStatus, classes, zohoUrl }} />
                : <LoggedOutState />
              : <LoadingState />
            }
          </Grid>
        </Grid>
      </div>
    </Page>
  )
}
