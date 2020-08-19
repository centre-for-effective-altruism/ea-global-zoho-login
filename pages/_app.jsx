// import App from 'next/app'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import HeadTags from 'components/HeadTags'

const bodyFontStack = ['Merriweather', 'Georgia', 'Times New Roman', 'serif'].join(',')
const titleFontStack = ['Roboto Slab', 'Helvetica', 'Arial', 'sans-serif']

const headings = [...Array(6)]
  .map((x, i) => `h${i + 1}`)
  .reduce((prev, curr) => ({
    ...prev,
    [curr]: { fontFamily: titleFontStack }
  }), {})

const SPACING_FACTOR = 8

const theme = createMuiTheme({
  spacing: SPACING_FACTOR,
  typography: {
    fontFamily: bodyFontStack,
    ...headings
  },
  palette: {
    primary: {
      main: '#0C869B',
      light: '#00B2BE',
      dark: '#1B5266'
    },
    secondary: {
      main: '#FC820E',
      dark: '#9E4D00'
    }
  },
  overrides: {
    MuiButton: {
      root: {
        fontFamily: titleFontStack
      }
    },
    MuiDivider: {
      root: {
        marginTop: SPACING_FACTOR * 4,
        marginBottom: SPACING_FACTOR * 4
      }
    }
  }
})

function MyApp({ Component, pageProps }) {
  return <>
    <HeadTags />
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  </>
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp
