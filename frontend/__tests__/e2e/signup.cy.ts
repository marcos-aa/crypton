import { EtherealCreds } from "../support/commands"
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
    cy.task("getUserCreds").then((c: EtherealCreds) => {
      fillWithName("Tester U.", c.email, c.pass)
    })

    cy.url().should("include", "/register/validate")
  })

  it(`I am redirected to the email validation page
            when trying to sign up with an unverified
            email address`, () => {
    cy.go("back")
    cy.task("getUserCreds").then((c: EtherealCreds) => {
      fillWithName("Tester U.", c.email, c.pass)
    })
    cy.url().should("include", "/register/validate")
  })
})
