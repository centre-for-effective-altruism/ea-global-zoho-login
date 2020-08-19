import Head from 'next/head'
import Container from '@material-ui/core/Container'

export default function Page ({ pageTitle, children }) {
  return (<>
    <Head>
      <title key='title'>{pageTitle && `${pageTitle} | `}EA Global Applications</title>
    </Head>
    <Container fixed>
      {children}
    </Container>
  </>)
}
