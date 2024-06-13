import { Tickers } from "@shared/types"
import { local } from "../../src/utils/helpers"
import { visitDashboard } from "../support/commands"

describe("User streams", () => {
  visitDashboard()

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

  it("I open and close the historical data page for a stream", () => {
    cy.intercept(
      "/tickers/window?symbols[]=1000SATSTRY&symbols[]=AAVEBNB&winsize=7d"
    ).as("getWindowTicks")
    cy.getWithAttr("expandStream").last().click()
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

  it("I delete a stream and disable the stream deletion prompt", () => {
    cy.getWithAttr("deleteStream").first().click()
    cy.get("[type='checkbox']").check()
    cy.getWithAttr("submitBtn").click()
    cy.getWithAttr("stream").should("have.length", 1)
    cy.checkTotals(1, 2, 2)
    cy.window().then((win) =>
      expect(win.localStorage.getItem(local.delPrompt)).to.equal("false")
    )
  })

  it("I delete a stream without interacting with the deletion prompt", () => {
    localStorage.setItem(local.delPrompt, "false")
    cy.getWithAttr("deleteStream").first().click()
    cy.getWithAttr("stream").should("have.length", 0)
    cy.checkTotals(0, 0, 0)
  })
})
