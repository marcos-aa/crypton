import { Tickers } from "@shared/types"

describe("User streams", () => {
  let atoken: string

  before(() => {
    cy.visit("/register/signin")
    cy.intercept("PUT", "/user").as("login")
    cy.fillAuthCreds(Cypress.env("MAIL_VERIFIED"), "Tester00")
    cy.wait("@login").then((intercepted) => {
      atoken = intercepted.response.body.accessToken
    })
  })

  beforeEach(() => {
    localStorage.setItem("u_token", atoken)
    cy.visit("/dashboard")
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

  it("I disable the stream deletion prompt and delete a stream", () => {
    cy.getWithAttr("deleteStream").first().click()
    cy.get("input[type=checkbox]").click()
    cy.getWithAttr("submitBtn").click()
    cy.getWithAttr("stream").should("have.length", 1)
    cy.checkTotals(1, 2, 2)
  })

  it("I open and close the historical data page for a stream", () => {
    cy.intercept(
      "/tickers/window?symbols[]=1000SATSTRY&symbols[]=AAVEBNB&winsize=7d"
    ).as("getWindowTicks")
    cy.getWithAttr("expandStream").first().click()
    cy.url().should("include", "/streams/historical")
    cy.contains("1s")
    cy.contains("7d")
    cy.wait("@getWindowTicks").then((intercepted) => {
      const body: Tickers = intercepted.response.body
      const inchTickers = {
        "1000SATSTRY": body["1000SATSTRY"],
        AAVEBNB: body["AAVEBNB"],
      }
      cy.checkTickerValue("1000SATSTRY", inchTickers["1000SATSTRY"])
      cy.checkTickerValue("AAVEBNB", inchTickers["AAVEBNB"])
    })

    cy.getWithAttr("closeInnerModal").click()
    cy.getWithAttr("historicalAsset").should("have.length", 0)
  })
})
