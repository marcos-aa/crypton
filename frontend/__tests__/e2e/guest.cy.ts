describe("Guest mode", () => {
  before(() => {
    cy.clearAllLocalStorage()
    cy.visit("/")
  })

  it("I log in with a guest account", () => {
    cy.getWithAttr("guestButton").click()
    cy.url().should("include", "/dashboard")
    cy.contains("Guest")
    const DMYDate = new Date().toLocaleDateString("en-UK")
    cy.contains(DMYDate)
    cy.getWithAttr("infoItem").each((el) => {
      expect(el.text().trim()).to.equal("0")
    })
    cy.contains("Create a new stream to get started")
  })
})
