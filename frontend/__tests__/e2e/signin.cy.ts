describe("User signin", () => {
  before(() => {
    cy.clearAllLocalStorage()
    cy.visit("/register/signin")
  })

  it("I fail to log in with invalid credentials", () => {
    cy.fillAuthCreds(Cypress.env("MAIL_VERIFIED"), "WrongPass01")
    cy.contains("Invalid email or password")
  })

  it("I fail to log in with an unverified account", () => {
    cy.getWithAttr("email").clear()
    cy.getWithAttr("password").clear()

    cy.fillAuthCreds(Cypress.env("MAIL_UNVERIFIED"), "Tester01")
    cy.url().should("include", "/register/validate")
  })

  it("I successfully log in with a verified account and valid credentials", () => {
    cy.go(-1)
    cy.fillAuthCreds(Cypress.env("MAIL_VERIFIED"), "Tester00")
    cy.url().should("include", "/dashboard")
    cy.contains("Jane Doe")
    cy.contains("26/05/2024")
  })
})
