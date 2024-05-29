export const baseURL = Cypress.config("baseUrl")

export function getCyElement(dataName: string) {
  return cy.get(`[data-cy=${dataName}]`)
}

export function fillAuthForm(
  email: string,
  password: string,
  gherkinKey: "When" | "And" = "When"
) {
  it(`${gherkinKey} I type '${email}' in the "Email" field`, () => {
    getCyElement("email").type(email)
  })

  it(`And I type '${password}' in the "Password" field`, () => {
    getCyElement("password").type(password)
  })

  it("And I click the on 'Sign in' button", () => {
    getCyElement("submitForm").click()
  })
}
