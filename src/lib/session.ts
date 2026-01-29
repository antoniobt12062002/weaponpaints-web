import { cookies } from "next/headers"

export interface Session {
  steamid: string
  name: string
  avatar: string
}

const SESSION_NAME = "steam_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function createSession(user: Session) {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify(user)

  cookieStore.set(SESSION_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionData = cookieStore.get(SESSION_NAME)?.value

    if (!sessionData) return null

    return JSON.parse(sessionData)
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_NAME)
}
