
const { BASE_URL, VERCEL_URL } = process.env

export const getBaseURL = () => BASE_URL || VERCEL_URL
