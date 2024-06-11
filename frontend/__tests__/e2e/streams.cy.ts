describe("User streams", () => {
  beforeEach(() => {
    cy.visit("/register/signin")
    cy.fillAuthCreds(Cypress.env("MAIL_VERIFIED"), "Tester00")
  })

  it("I open and close the assets page", () => {
    cy.getWithAttr("createStream").click()
    cy.url().should("include", "/dashboard/streams")
    cy.getWithAttr("asset").should("have.length.greaterThan", 2000)
    cy.getWithAttr("formCancel").click()
    cy.getWithAttr("asset").should("have.length", 0)
  })

  it("I create a stream with the '1INCHSATSTRY' and 'AAVEBNB' assets", () => {
    cy.getWithAttr("createStream").click()
    cy.contains("1000SATSTRY").click()
    cy.contains("AAVEBNB").click()
    cy.waitForStream()
    cy.getWithAttr("stream").should("have.length", 1)
    cy.contains("1000SATSTRY")
    cy.contains("AAVEBNB")
    cy.checkTotals(1, 2, 2)
  })

  it("I create a stream with the duplicate 'AAVEBNB' asset and the unique '1INCHBTC' asset", () => {
    cy.getWithAttr("createStream").click()
    cy.contains("AAVEBNB").click()
    cy.contains("1INCHBTC").click()
    cy.waitForStream()
    cy.getWithAttr("stream").should("have.length", 2)
    cy.get("[data-cy=stream] h2").should("have.length", 4)
    cy.checkTotals(2, 4, 3)
  })

  it("I modify a stream, removing the '1INCHBTC' symbol", () => {
    cy.getWithAttr("editStream").first().click()
    cy.getWithAttr("selectedAsset").should("have.length", 2).first().click()
    cy.getWithAttr("selectedAsset").should("have.length", 1)
    cy.getWithAttr("submitBtn").click()
    cy.getWithAttr("stream").should("have.length", 2)
    cy.checkTotals(2, 3, 3)
  })
})
