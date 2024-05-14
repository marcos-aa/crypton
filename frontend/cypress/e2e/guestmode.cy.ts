describe("Guest mode", () => {
  describe("User logs as guest for the first time", () => {
    it("Given the user is on the home page", () => {
      localStorage.clear()
      cy.visit("/")
    })

    it("When the user clicks the 'Get realtime updates now' button", () => {
      cy.get(`button[class*="action"]`).click()
    })

    it("Then the user should be redirected to the dashboard page", () => {
      cy.url().should("match", new RegExp(`^http://localhost:3001/dashboard$`))
    })

    it("And the user should see the current date as their join date", () => {
      const date = new Date()
      const formattedDate = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`
      const joinData = cy.get("div > p[class*='infoItem'] span").first()
      joinData.should("have.text", formattedDate)
    })

    it("And the user should see a zeroed total of unique symbols, total symbols and total streams", () => {})
    it("And the user should see a CTA to create a stream", () => {})
  })
})
