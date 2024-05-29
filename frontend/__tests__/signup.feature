Feature: User sign up
   I want to create a new Crypton account

   Background:
    Given I go to '/register/signup'

  Scenario Outline: Sign up attempt with varying input
    When I type <uname> in 'Name' field
    And I type <email> in the 'Email' field
    And I type <password> in the 'Password' field
    And I click the 'Sign up' button
    Then I should <outcome>

  Examples:
  | name      | email                             | password  | isVerified | outcome                                                  |
  | ------    | -------------------------------   | --------  | ---------- | -------------------------------------------------------- |
  | Tester    | marcosandrade+crypton@gmail.com   | Tester01  | true       | see a "This email is already registered." error message  |
  | Tester U. | marcosandrade+uncrypton@test.com  | Tester01  | false      | be redirected to email validation page                   |
  | Crypton   | crypton@crypton.icu               | Crypton00 | not-in-db  | be redirected to email validation page                   |
