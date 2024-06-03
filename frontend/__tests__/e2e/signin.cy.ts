const verifiedMail = "crypton+verified@crypton.icu"

describe("User signin", () => {
  before(() => {
    cy.clearAllLocalStorage()
    cy.visit("/register/signin")
  })

  it("I fail to log in with invalid credentials", () => {
    cy.fillAuthCreds(verifiedMail, "WrongPass01")
    cy.contains("Invalid email or password")
  })

  it("I fail to log in with an unverified account", () => {
    cy.getWithAttr("email").clear()
    cy.getWithAttr("password").clear()

    cy.fillAuthCreds("crypton@crypton.icu", "Tester01")
    cy.url().should("include", "/register/validate")
  })

  it("I successfully log in with a verified account and valid credentials", () => {
    cy.go(-1)
    cy.fillAuthCreds(verifiedMail, "Tester00")
    cy.url().should("include", "/dashboard")
    cy.contains("Tester")
    cy.contains("26/05/2024")
  })
})
