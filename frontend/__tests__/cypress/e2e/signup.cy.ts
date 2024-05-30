import { baseURL, fillAuthForm, getCyElement } from "../utils"

function fillWithName(name: string, email: string, password: string) {
  it(`When I type '${name}' in the "Name" field`, () => {
    getCyElement("name").type(name)
  })

  fillAuthForm(email, password, "And")
}

describe("User signup", () => {
  before(() => {
    cy.task("clear:unverified")
    cy.clearAllLocalStorage()
    cy.visit("/register/signup")
  })

  describe("I fail to create an account with an already verified email address", () => {
    fillWithName("Tester", "crypton+verified@crypton.icu", "Tester01")

    it("Then I should see a 'This email is already registered.' error message", () => {
      cy.contains("This email is already registered.")
    })
  })

  describe("I successfully create a new account with an unregistered email address", () => {
    before(() =>
      cy.get("input[data-cy]").each(($el) => {
        cy.wrap($el).clear()
      })
    )
    fillWithName("Tester U.", "crypton@crypton.icu", "Tester01")

    it("Then I should be redirected to the email validation page", () => {
      cy.url().should("eq", baseURL + "/register/validate")
    })
  })

  describe(`I am redirected to the email validation page 
            when trying to sign up with an unverified 
            email address`, () => {
    before(() => cy.go("back"))
    fillWithName("Tester U.", "crypton@crypton.icu", "Tester01")

    it("Then I should be redirected to the email validation page", () => {
      cy.url().should("eq", baseURL + "/register/validate")
    })
  })
})
