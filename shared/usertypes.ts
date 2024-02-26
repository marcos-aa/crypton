export interface User {
  id: string;
  email: string;
  name: string;
  refresh_token: string;
  created_at: Date;
  verified: boolean;
}

export interface UserData {
  user: User;
  access_token: string;
}
