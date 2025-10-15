import { logout } from './action'

export default async function LogoutPage() {
  await logout()
  return null
}
