/// <reference types="cypress" />

import { Ticker } from "@shared/types"
import { local } from "../../src/utils/helpers"

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
    }
  }
}

export function visitDashboard() {
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
    cy.visit("/dashboard")
    localStorage.setItem(local.token, atoken)
  })
}

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
