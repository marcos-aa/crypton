Feature: User sign up
   I want to create a new Crypton account

   Background:
    Given I am on the '/register/signup' page

  Scenario Outline: Sign up attempts with varying input data
    When I type <uname> in the 'Name' field
    And I type <email> in the 'Email' field
    And I type <password> in the 'Password' field
    And I click the 'Sign up' button
    Then I should <outcome>

  Scenario: 
  Examples:
  | name      | email                          | password  | isVerified | outcome                                                  |
  | Tester    | crypton+verified@crypton.icu   | Tester00  | true       | see a "This email is already registered." error message  |
  | Tester U. | crypton@crypton.icu            | Tester01  | not-in-db  | be redirected to the email validation page               |
  | Tester U. | crypton@crypton.icu            | Tester01  | false      | be redirected to the email validation page               |