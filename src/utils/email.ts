import { WebClient } from '@slack/web-api'

export const getUserEmail = async (token, event) => {
  const webClient = new WebClient(token)
  const userInfo = await webClient.users.info({ user: event.event.user })
  const email = userInfo.user?.profile?.email
  //   console.log("Email", email);
  return email
}
