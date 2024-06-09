function fillWithName(name: string, email: string, password: string) {
  cy.getWithAttr("name").type(name)
  cy.fillAuthCreds(email, password)
}

describe("User signup", () => {
  before(() => {
    cy.clearAllLocalStorage()
    cy.visit("/register/signup")
  })

  it("I fail to create an account with an used email address", () => {
    fillWithName("Tester", "crypton+verified@crypton.icu", "Tester01")
    cy.contains("This email is already registered.")
  })

  it("I successfully create a new account with an unused email address", () => {
    cy.get("input[data-cy]").each(($el) => cy.wrap($el).clear())
    fillWithName("Tertes", Cypress.env("MAILSAC_MAIL"), "Mailsac00")
    cy.url().should("include", "/register/validate")
  })

  it(`I am redirected to the email validation page when trying to sign up with an unverified account`, () => {
    cy.go("back")
    fillWithName("Tertes", Cypress.env("MAILSAC_MAIL"), "Mailsac00")

    cy.url().should("include", "/register/validate")
  })

  it("I fail to validate an account with an invalid code", () => {
    cy.getWithAttr("emailCode").type("invalid")
    cy.getWithAttr("submitForm").click()
    cy.contains("Invalid code")
  })

  it("I resend a verification code to my email address", () => {
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
    cy.reload()
  })

  it("I use a valid code to verify an account", () => {
    cy.task("getUserMail").then((htmlString: string) => {
      const parser = new DOMParser()
      const parsedHtml = parser.parseFromString(htmlString, "text/html")
      const code = parsedHtml.querySelector("code").textContent.trim()

      cy.getWithAttr("emailCode").clear()
      cy.getWithAttr("emailCode").type(code)
      cy.getWithAttr("submitForm").click()
      cy.contains("Tertes")
    })
  })
})
