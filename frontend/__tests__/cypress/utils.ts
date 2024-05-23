export function getCyElement(dataName: string) {
  return cy.get(`[data-cy=${dataName}]`)
}

export const baseURL = Cypress.config("baseUrl")
