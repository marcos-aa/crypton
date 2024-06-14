import { parseEmail } from "../support/commands"

const unverifiedPass = "Mailsac00"

describe("User signup", () => {
  beforeEach(() => cy.visit("/register/signup"))

  it("I fail to create an account with an used email address", () => {
    cy.fillSignUp("Jane Doe", Cypress.env("MAIL_VERIFIED"), "Tester01")
    cy.contains("This email is already registered.")
  })

  it(`I am redirected to the email validation page when trying to sign up with an unverified account`, () => {
    cy.fillSignUp("John Smith", Cypress.env("MAIL_UNVERIFIED"), unverifiedPass)
    cy.url().should("include", "/register/validate")
  })

  it("I successfully create a new account with an unused email address", () => {
    cy.fillSignUp("John Doe", Cypress.env("MAILSAC_MAIL"), unverifiedPass)
    cy.url().should("include", "/register/validate")
  })

  it("I fail to validate an account with an invalid code", () => {
    cy.fillSignUp("John Doe", Cypress.env("MAILSAC_MAIL"), unverifiedPass)
    cy.getWithAttr("emailCode").type("invalid")
    cy.getWithAttr("submitForm").click()
    cy.contains("Invalid code")
  })

  it("I resend a verification code to my email address", () => {
    cy.fillSignUp("John Doe", Cypress.env("MAILSAC_MAIL"), unverifiedPass)
    cy.getWithAttr("resendCode").click()
    cy.contains("We sent a verification code to your email address")
  })

  it("I fetch a verification code from my email inbox", () => {
    cy.task("getUserMail").then((htmlString: string) => {
      cy.document({ log: false }).invoke({ log: false }, "write", htmlString)
    })

    cy.get("code")
      .then((el) => el.text().trim())
      .should("have.length", 6)
  })

  it("I use a valid code to verify an account", () => {
    cy.task("getUserMail").then((htmlString: string) => {
      const code = parseEmail(htmlString)

      cy.fillSignUp("John Doe", Cypress.env("MAILSAC_MAIL"), unverifiedPass)
      cy.getWithAttr("emailCode").type(code)
      cy.getWithAttr("submitForm").click()
      cy.contains("John Doe")
    })
  })
})
