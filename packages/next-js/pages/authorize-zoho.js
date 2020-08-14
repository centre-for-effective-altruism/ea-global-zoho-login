import { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import Page from 'components/Page'

export default function AuthorizeZoho () {
  return (
    <Page pageTitle='Authorize Zoho'>
      <Typography align='center' variant='h2' component='h1' gutterBottom>Authorize Zoho</Typography>
      <Grid container spacing={6} justify='center'>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>
            This page is for use by administrators at the Centre for Effective Altruism only!{' '}
            <Link href='/'>Back to the home page</Link>.
          </Typography>
          <Button variant='contained' fullWidth href='/api/zoho/authorize'>Authorize Zoho</Button>
        </Grid>
      </Grid>
    </Page>
  )
}
