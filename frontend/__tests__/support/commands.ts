/// <reference types="cypress" />

import { Ticker } from "@shared/types"

export interface EtherealCreds {
  email: string
  pass: string
}

declare global {
  namespace Cypress {
    interface Chainable {
      getWithAttr(attr: string): Cypress.Chainable<JQuery<HTMLElement>>
      fillAuthCreds(email: string, password: string): void
      fillSignUp(name: string, email: string, password: string): void
      checkTotals(streams: number, assets: number, uniques: number): void
      checkTickerValue(asset: string, value: Ticker): void
      waitForStream(): void
      setupDropdown(): void
      openSettings(): void
      login(email: string, password: string): void
    }
  }
}
export function parseEmail(html: string): string {
  const parser = new DOMParser()
  const parsedHtml = parser.parseFromString(html, "text/html")
  const code = parsedHtml.querySelector("code").textContent.trim()
  return code
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/register/signin")
  cy.intercept("PUT", "/user").as("login")
  cy.fillAuthCreds(email, password)
  cy.wait("@login")
})
Cypress.Commands.add("setupDropdown", () => {
  // Cypress does not support hover events

  cy.getWithAttr("dropOptions").then((el) => {
    cy.getWithAttr("dropSettings").then((drop) => {
      drop.get()
      drop.on("mouseover", () => {
        el.css("visibility", "visible")
      })

      drop.on("mouseout", () => {
        el.css("visibility", "hidden")
      })
    })
  })
})

Cypress.Commands.add("openSettings", () => {
  cy.setupDropdown()
  cy.setupDropdown()
  cy.getWithAttr("dropSettings").trigger("mouseover")
  cy.getWithAttr("openSettings").click()
})

Cypress.Commands.add("checkTickerValue", (asset: string, value: Ticker) => {
  cy.getWithAttr("historicalAsset")
    .contains(asset)
    .siblings("[data-cy=historicalData]")
    .within(() => {
      cy.contains(`Last price: ${value.last}`)
      cy.contains(`Weighted average: ${value.average}`)
      cy.contains(`Price change: ${value.change}`)
      cy.contains(`Price change %: ${value.pchange}`)
    })
})

Cypress.Commands.add(
  "checkTotals",
  (streams: number, assets: number, uniques: number) => {
    cy.contains(`Streams: ${streams}`)
    cy.contains(`Assets: ${assets}`)
    cy.contains(`Unique assets: ${uniques}`)
  }
)

Cypress.Commands.add(
  "fillSignUp",
  (name: string, email: string, password: string) => {
    cy.getWithAttr("name").type(name)
    cy.fillAuthCreds(email, password)
  }
)

Cypress.Commands.add("waitForStream", () => {
  cy.intercept("POST", "/streams").as("newStream")
  cy.getWithAttr("submitBtn").click()
  cy.wait("@newStream")
})
Cypress.Commands.add("getWithAttr", (attr: string) => {
  return cy.get(`[data-cy=${attr}]`)
})

Cypress.Commands.add("fillAuthCreds", (email: string, password: string) => {
  cy.getWithAttr("email").type(email)
  cy.getWithAttr("password").type(password)
  cy.getWithAttr("submitForm").click()
})
