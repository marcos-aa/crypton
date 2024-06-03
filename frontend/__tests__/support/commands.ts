/// <reference types="cypress" />
export interface EtherealCreds {
  email: string
  pass: string
}

declare global {
  namespace Cypress {
    interface Chainable {
      getWithAttr(attr: string): Cypress.Chainable<JQuery<HTMLElement>>
      fillAuthCreds(email: string, password: string): void
    }
  }
}

Cypress.Commands.add("getWithAttr", (attr: string) => {
  return cy.get(`[data-cy=${attr}]`)
})

Cypress.Commands.add("fillAuthCreds", (email: string, password: string) => {
  cy.getWithAttr("email").type(email)
  cy.getWithAttr("password").type(password)
  cy.getWithAttr("submitForm").click()
})
