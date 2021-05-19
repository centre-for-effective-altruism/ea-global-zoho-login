import Head from 'next/head'
import { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import Page from 'components/Page'
import Alert from '@material-ui/lab/Alert'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/styles'
import Cookie from 'universal-cookie'
import { useRouter } from 'next/router'
import { RETURN_DATA_COOKIE_NAME, cookieOpts } from 'lib/cookie'
import { getEventApplicationForms } from 'lib/contentful'
import url from 'url'
/*
import LoginIcon from '@material-ui/icons/Lock'
import ExitIcon from '@material-ui/icons/ExitToApp'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
*/
const LoginIcon = () => null
const ExitIcon = () => null
const ChevronRightIcon = () => null

const cookie = new Cookie()

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
      {!zohoUrl && <>
          <Alert severity='info'>Hang on a second, we're just getting the system ready... <CircularProgress size='1rem' /></Alert>
        </>
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

export default function Home({ user, applicationForms }) {
  const [loginChecked, setLoginChecked] = useState(false)
  const [me, setMe] = useState(null)
  const [authParams, setAuthParams] = useState(null)
  const [verificationResendStatus, setVerificationResendStatus] = useState({ message: null, state: null})
  const [returnReference, setReturnReference] = useState(null)
  const { query } = useRouter()

  const getMe = async () => {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      setMe(await res.json())
    }
    setLoginChecked(true)
  }

  const getAuthParams = async (me) => {
    const res = await fetch('/api/zoho/update-token')
    if (res.ok) {
      const { email, token } = await res.json()
      setAuthParams({ email, token })
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

  const validateReturnURL = () => {
    const { return_reference, ...rest } = query
    if (return_reference && getApplicationForm(return_reference)) {
      cookie.set(RETURN_DATA_COOKIE_NAME, { return_reference, query: { ...rest } }, cookieOpts)
      setReturnReference(return_reference)
    }
  }

  const getReturnURLDataFromCookie = () => {
    return cookie.get(RETURN_DATA_COOKIE_NAME, cookieOpts)

  }

  const getApplicationForm = reference => {
    const applicationForm = applicationForms.filter(form => form.fields.reference === reference)[0]
    return applicationForm?.fields
  }

  const getEventData = (reference) => {
    const applicationForm = getApplicationForm(reference)
    return applicationForm?.event.fields
  }

  const buildReturnURL = () => {
    if (!authParams) return
    const applicationForm = getApplicationForm(returnReference)
    const cookieData = getReturnURLDataFromCookie()
    const parsedUrl = url.parse(applicationForm.returnUrl, true)
    delete parsedUrl.search
    parsedUrl.query = {
      ...parsedUrl.query,
      ...authParams,
      ...cookieData.query
    }
    const returnUrl = url.format(parsedUrl)
    return returnUrl
  }

  useEffect(() => {
    validateReturnURL()
  }, [query])

  useEffect(() => {
    // set previously-stored return URL from cookie data
    const cookieData = getReturnURLDataFromCookie()
    if (cookieData?.return_reference) setReturnReference(cookieData.return_reference)
    // get user data via API
    getMe()
  }, [])

  useEffect(() => {
    if (me && me.email_verified) getAuthParams()
  }, [me])

  const classes = useStyles()
  const ApplicationForm = getApplicationForm(returnReference)
  const Event = getEventData(returnReference)
  const zohoUrl = buildReturnURL()

  return (
    <Page pageTitle="Welcome">
      <div className={classes.wrapper}>
        <Grid container justify="center">
          <Grid item sm={8} md={6}>
            {returnReference ? (
              <>
                <Head>
                  <title>
                    {Event.title} |{' '}
                    {ApplicationForm.formAction}
                  </title>
                </Head>
                <Typography
                  align="center"
                  variant="h2"
                  component="h1"
                  gutterBottom
                >
                  {Event.title}
                </Typography>
                <Typography align="center" variant="h4" gutterBottom>
                  {ApplicationForm.formAction}
                </Typography>
                {loginChecked ? (
                  me ? (
                    <LoggedInState
                      {...{
                        me,
                        resendVerificationEmail,
                        verificationResendStatus,
                        classes,
                        zohoUrl,
                      }}
                    />
                  ) : (
                    <LoggedOutState />
                  )
                ) : (
                  <LoadingState />
                )}
              </>
            ) : (
              <Alert severity="warning">
                Oops! It looks like you got to this page without following a
                valid link. If you're trying to register for an event, please
                check for an email from the CEA Events team, and follow the link
                to the registration/application form.
              </Alert>
            )}
          </Grid>
        </Grid>
      </div>
    </Page>
  )
}

export async function getStaticProps () {
  const applicationForms = await getEventApplicationForms()
  return {
    props: {
      applicationForms
    },
    revalidate: 30
  }
}
