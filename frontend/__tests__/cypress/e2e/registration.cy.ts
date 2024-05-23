import { baseURL, getCyElement } from "../utils"
describe("User registration", () => {
  before(() => cy.clearAllLocalStorage())

  describe("Guest logs in", () => {
    it("Given a guest is on the home page", () => {
      cy.visit("/")
    })

    it("When the guest clicks the 'Get realtime updates now' button", () => {
      getCyElement("guestButton").click()
    })

    it("Then the guest should be redirected to the dashboard page", () => {
      cy.url().should("eq", baseURL + "/dashboard")
    })

    it("And the guest should see 'Guest' as their display name", () => {
      cy.contains("Guest")
    })

    it(`And the guest should see the following in the user information panel: 
          * the date of registration as their 'Joined at', 
          * a total of 0 unique symbols, 
          * a total of 0 symbols, 
          * a total of 0 streams`, () => {
      const DMYDate = new Date().toLocaleDateString("en-UK")

      getCyElement("joinDate").should("have.text", DMYDate)
      getCyElement("infoItem").each((el) => {
        expect(el.text().trim()).to.equal("0")
      })
    })

    it("And the guest should see a call to action to create a stream", () => {
      cy.contains("Create a new stream to get started")
    })
  })
})
