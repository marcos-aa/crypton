Feature: User sign up
   I want to create a new Crypton account

   Background:
    Given I am on the '/register/signup' page

  Scenario Outline: Sign up attempt with varying input data
    When I type <uname> in the 'Name' field
    And I type <email> in the 'Email' field
    And I type <password> in the 'Password' field
    And I click the 'Sign up' button
    Then I should <outcome>

  Examples:
  | name      | email                              | password  | isVerified | outcome                                                  |
  | ------    | -------------------------------    | --------  | ---------- | -------------------------------------------------------- |
  | Tester    | marcosandrade.it+crypton@gmail.com | Tester01  | true       | see a "This email is already registered." error message  |
  | Crypton   | crypton@crypton.icu                | Crypton00 | not-in-db  | be redirected to the email validation page               |
  | Crypton   | crypton@crypton.icu                | Crypton00 | false      | be redirected to the email validation page               |