function fillWithName(name: string, email: string, password: string) {
  cy.getWithAttr("name").type(name)
  cy.fillAuthCreds(email, password)
}

describe("User signup", () => {
  before(() => {
    cy.clearAllLocalStorage()
    cy.visit("/register/signup")
  })

  it("I fail to create an account with an already verified email address", () => {
    fillWithName("Tester", "crypton+verified@crypton.icu", "Tester01")
    cy.contains("This email is already registered.")
  })

  it("I successfully create a new account with an unregistered email address", () => {
    cy.get("input[data-cy]").each(($el) => cy.wrap($el).clear())
    fillWithName("Tertes", Cypress.env("MAILSAC_MAIL"), "Mailsac00")
    cy.url().should("include", "/register/validate")
  })

  it(`I am redirected to the email validation page when trying to sign up with an unverified email address`, () => {
    cy.go("back")
    fillWithName("Tertes", Cypress.env("MAILSAC_MAIL"), "Mailsac00")

    cy.url().should("include", "/register/validate")
  })

  it("I fail to validate an account with an invalid code", () => {
    cy.getWithAttr("emailCode").type("invalid")
    cy.getWithAttr("submitForm").click()
    cy.contains("Invalid code")
  })

  it("I resend a email verification code to my email address", () => {
    cy.getWithAttr("resendCode").click()
    cy.contains("We sent a verification code to your email address")
  })

  it("I use a valid verification code to verify an account", () => {
    cy.task("getUserMail").then((res: string) => {
      const parser = new DOMParser()
      const parsedHtml = parser.parseFromString(res, "text/html")
      const code = parsedHtml.querySelector("code").textContent.trim()

      cy.getWithAttr("emailCode").clear()
      cy.getWithAttr("emailCode").type(code)
      cy.getWithAttr("submitForm").click()
      cy.contains("Tertes")
    })
  })
})
