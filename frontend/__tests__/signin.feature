Feature: User signin
   I want to log into Crypton with my email and password

   Background:
    Given I go to '/register/signin'

  Scenario Outline: Log in attempt with varying credentials
    When I type <email> in the 'Email' field
    And I type  <password> in the 'Password' field
    And I click the 'Sign in' button
    Then I should <outcome>
  
  Examples:
    | email                             | password  | createdAt  | verified | outcome
    | marcosandrade+crypton@gmail.com   | WrnPass01 | 26/05/2024 | true     | see a 'Invalid credentials' error message
    | marcosandrade+uncrypton@test.com  | Tester01  | 26/05/2024 | false    | be redirected to the email validation page

  Scenario: I successfully log in with a verified account and valid credentials
    When I type 'marcosandrade+crypton@gmail.com' in the 'Email' field
    And I type  'Tester00' in the 'Password' field
    And I click the 'Sign in' button
    Then I should be redirected to the dashboard page
    And I should see the user chosen name 'Tester' in the 'display name' field
    And I should see '26/05/2024' in the 'Joined at' field


