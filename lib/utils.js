
const { BASE_URL, VERCEL_URL } = process.env

export const getBaseURL = () => {
  if (VERCEL_URL) return `https://${VERCEL_URL}`
  return BASE_URL
}
