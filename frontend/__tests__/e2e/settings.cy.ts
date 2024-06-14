import { visitDashboard } from "../support/commands"

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

  it("I try to export local streams when there are none", () => {
    cy.setupDropdown()
    cy.getWithAttr("dropSettings").trigger("mouseover")
    cy.getWithAttr("exportCta").click()
    cy.contains("No local streams found")
  })
})
