import { baseURL, getCyElement } from "../utils"

const verifiedMail = "marcosandrade.it+crypton@gmail.com"

const fillAndSubmit = (email: string, password: string) => {
  it(`When I type '${email}' on the "Email" field`, () => {
    getCyElement("email").type(email)
  })

  it(`And I type '${password}' on the "Password" field`, () => {
    getCyElement("password").type(password)
  })

  it("And I click the on 'Sign in' button", () => {
    getCyElement("submitForm").click()
  })
}

describe("User signin", () => {
  before(() => {
    cy.clearAllLocalStorage()
    cy.visit("/register/signin")
  })

  describe("I fail to log in with invalid credentials", () => {
    fillAndSubmit(verifiedMail, "WrongPass01")

    it("Then I should see a 'Invalid credentials' error message", () => {
      cy.contains("Invalid email or password")
    })
  })

  describe("I fail to log in with an unverified account", () => {
    before(() => {
      getCyElement("email").clear()
      getCyElement("password").clear()
    })

    fillAndSubmit("marcosandrade.it+uncrypton@gmail.com", "Tester01")

    it("Then I should be redirected to the email validation page", () => {
      cy.url().should("eq", baseURL + "/register/validate")
    })
  })

  describe("I successfully log in with a verified account and valid credentials", () => {
    before(() => cy.go(-1))
    fillAndSubmit(verifiedMail, "Tester00")

    it("Then I should be redirected to the dashboard page", () => {
      cy.url().should("eq", baseURL + "/dashboard")
    })

    it("And I should see the user chosen name 'Tester' in the 'display name' field", () => {
      cy.contains("Tester")
    })

    it("And I should see '26/05/2024' in the 'Joined at' field", () => {
      cy.contains("26/05/2024")
    })
  })
})
