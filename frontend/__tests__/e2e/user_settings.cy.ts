import { local } from "../../src/utils/helpers"
import { parseEmail, visitDashboard } from "../support/commands"

describe("User settings", () => {
  visitDashboard()

  it("I open and close the settings dropdown", () => {
    cy.setupDropdown()
    cy.getWithAttr("dropSettings").trigger("mouseover")
    cy.getWithAttr("openSettings").should("be.visible")
    cy.getWithAttr("exportCta").should("be.visible")
    cy.getWithAttr("logoutButton").should("be.visible")

    cy.getWithAttr("dropSettings").trigger("mouseout")
    cy.getWithAttr("openSettings").should("not.be.visible")
    cy.getWithAttr("exportCta").should("not.be.visible")
    cy.getWithAttr("logoutButton").should("not.be.visible")
  })

  it("I try to export local streams when there are none", () => {
    cy.setupDropdown()
    cy.getWithAttr("dropSettings").trigger("mouseover")
    cy.getWithAttr("exportCta").click()
    cy.contains("No local streams found")
  })

  it("I change my username", () => {
    cy.openSettings()
    cy.get("input[name='name']").type("Jane M. Doe")
    cy.getWithAttr("submitBtn").click()
    cy.getWithAttr("nameLabel").should("have.text", "Jane M. Doe")
    cy.getWithAttr("closeInnerModal").click()
    cy.getWithAttr("username").should("have.text", "Jane M. Doe")
  })

  it("I change my email address", () => {
    cy.openSettings()
    const newmail: string = Cypress.env("MAILSAC_MAIL").replace(
      "@mailsac.com",
      "+updated@mailsac.com"
    )

    cy.getWithAttr("changeEmail").click()
    cy.getWithAttr("email").type(newmail)
    cy.getWithAttr("password").type(Cypress.env("MAIL_PASS"))
    cy.intercept("PUT", "/user/email").as("updateEmail")
    cy.getWithAttr("submitForm").click()
    cy.wait("@updateEmail")
    cy.wait(1000)

    cy.task("getUserMail").then((htmlString: string) => {
      const code = parseEmail(htmlString)
      cy.getWithAttr("emailCode").type(code)
      cy.getWithAttr("submitForm").click()
      cy.openSettings()
      cy.contains(newmail)
    })
  })

  it("I change my password", () => {
    cy.openSettings()
    cy.getWithAttr("changePassword").click()
    cy.getWithAttr("password").type("NewPassword00")
    cy.intercept("PUT", "/user/password").as("updatePassword")
    cy.getWithAttr("submitForm").click()
    cy.wait("@updatePassword")
    cy.wait(1000)

    cy.task("getUserMail").then((htmlString: string) => {
      const code = parseEmail(htmlString)
      cy.getWithAttr("emailCode").type(code)
      cy.getWithAttr("submitForm").click()
      cy.url().should("eq", Cypress.config().baseUrl + "/dashboard")
    })
  })

  it("I log out", () => {
    cy.setupDropdown()
    cy.getWithAttr("dropSettings").trigger("mouseover")
    cy.getWithAttr("logoutButton").click()
    cy.url()
      .should("eq", Cypress.config().baseUrl + "/")
      .then(() => {
        expect(localStorage.getItem(local.token)).to.not.exist
      })
    cy.getCookie("r_token").should("not.exist")
  })
})
