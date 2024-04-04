export interface UIUser {
  id: string
  email: string
  name: string
  createdAt: Date
  verified: boolean
}

export interface UserData {
  user: UIUser
  accessToken: string
}

export interface UserTokens extends UserData {
  refreshToken: string
}
