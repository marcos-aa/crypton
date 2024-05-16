function getCyElement(tag: string, dataName: string) {
  return cy.get(`${tag}[data-cy=${dataName}]`)
}

const baseUrl = Cypress.config("baseUrl")

describe("Guest mode", () => {
  describe("User logs as guest for the first time", () => {
    before(() => cy.clearAllLocalStorage())

    it("Given the user is on the home page", () => {
      cy.visit("/")
    })

    it("When the user clicks the 'Get realtime updates now' button", () => {
      getCyElement("button", "guestButton").click()
    })

    it("Then the user should be redirected to the dashboard page", () => {
      cy.url().should("eq", baseUrl + "/dashboard")
    })

    it("And the user should see the current date as their join date", () => {
      const date = new Date()
      const formattedDate = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`

      getCyElement("span", "joinDate").should("have.text", formattedDate)
    })

    it("And the user should see a zeroed total of unique symbols, total symbols and total streams", () => {
      getCyElement("span", "infoItem").each((el) => {
        expect(el.text().trim()).to.equal("0")
      })
    })

    it("And the user should see a CTA to create a stream", () => {
      getCyElement("h2", "streamCta").should("be.visible")
    })
  })

  describe("User opens stream creation modal", () => {
    it("Given that the user is on the dashboard page", () => {
      cy.visit("/dashboard")
    })

    it("When the user clicks the 'Create' button", () => {
      getCyElement("a", "createStream").click()
    })

    it("Then the user should be redirected to the stream creation page", () => {
      cy.url().should("eq", baseUrl + "/dashboard/streams")
    })

    it("And the user should see all the available crypto currency pairs", () => {
      getCyElement("li", "cryptoPair").should("have.length.above", 2000)
    })

    it("And the user should see a disabled button to create a stream", () => {
      getCyElement("button", "submitBtn").should("be.visible")
    })

    it("And the user should see a button to cancel stream creation", () => {
      getCyElement("a", "formCancel").should("have.attr", "href", "/dashboard")
    })
  })
})
