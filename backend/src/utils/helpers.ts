import { compareSync } from "bcryptjs"
import { CookieOptions } from "express"
import { sign } from "jsonwebtoken"
import { CredError, messages } from "./schemas"

const checkPassword = (pass: string, hash: string) => {
  if (!compareSync(pass, hash))
    throw new CredError(messages.invalidCredentials, 401)
}

const genCookie = () => {
  const isProd = process.env.NODE_ENV === "production"
  const cookieConfig: CookieOptions = {
    httpOnly: true,
    maxAge: Number(process.env.MAX_REFRESH),
    secure: isProd,
    sameSite: "lax",
  }

  if (isProd) cookieConfig.domain = "." + process.env.DOMAIN.substring(8)
  return cookieConfig
}
const signToken = (id: string, secret: string, expiration: string) => {
  const token = sign({ id }, secret, {
    expiresIn: expiration,
  })

  return token
}

const genMailHtml = (subject: string, code: string) => {
  const stringfied = `
  <div
   style="
    width: 100%;
    height: 600px;
    max-height: 100%;
    display: flex;
    justify-content: center;
    background-color: #f0f2f4;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
  "
  >
    <div
      style="
        background-color: white;
        border-radius: 3px;
        padding: 5px 10px;
        margin: auto;
        width: 600px;
        height: fit-content;
        max-height: 90%;
        max-width: 100%;
        min-height: 200px;
        gap: 5px;
        font-family: &quot;Lucida Sans&quot;, &quot;Lucida Sans Regular&quot;,
          &quot;Lucida Grande&quot;, &quot;Lucida Sans Unicode&quot;, Geneva,
          Verdana, sans-serif;
      "
    >
      <a
        href="https://crypton.icu"
        style="
          display: block;
          color: black;
          text-decoration: none;
          font-size: xx-large;
          width: 100%;
          font-weight: bold;
          max-width: 100%;
          border-bottom: 1px solid rgba(0, 0, 0, 0.3);
        "
      >
        CRYPT<span style="color: green">ON </span>
      </a>
  
      <p style="margin: 10px 0; width: 100%">
        Use the following code on our app to ${
          subject.charAt(0).toLowerCase() + subject.slice(1)
        }:
      </p>
      <code
        style="
          display: block;
          background-color: #f4f4f4;
          padding: 10px;
          margin: 5px 0;
          width: 100%;
          box-sizing: border-box;
        "
      >
        ${code}
      </code>
      <p style="color: #8898aa; margin: 10px 0">This code will expire in one hour.</p>
    </div>
  </div>
  `
  return stringfied
}
export { checkPassword, genCookie, genMailHtml, signToken }
