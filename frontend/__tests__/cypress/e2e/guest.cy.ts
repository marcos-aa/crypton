import { baseURL, getCyElement } from "../utils"
describe("Guest mode", () => {
  before(() => cy.clearAllLocalStorage())

  describe("I log in with a guest account", () => {
    it("Given I am on the home page", () => {
      cy.visit("/")
    })

    it("When I click the 'Get realtime updates now' button", () => {
      getCyElement("guestButton").click()
    })

    it("Then I should be redirected to the dashboard page", () => {
      cy.url().should("eq", baseURL + "/dashboard")
    })

    it("And I should see 'Guest' in the 'display name' field", () => {
      cy.contains("Guest")
    })

    it(`And I should see the following in the user information panel:
            * the date of registration as my 'Joined at'
            * a total of 0 unique symbols
            * a total of 0 symbols
            * a total of 0 streams`, () => {
      const DMYDate = new Date().toLocaleDateString("en-UK")

      cy.contains(DMYDate)
      getCyElement("infoItem").each((el) => {
        expect(el.text().trim()).to.equal("0")
      })
    })

    it("And I should see a call to action to create a stream", () => {
      cy.contains("Create a new stream to get started")
    })
  })
})
