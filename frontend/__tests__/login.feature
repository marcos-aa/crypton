Feature: Login
   I want to log into Crypton with my email and password

   Background:
    Given I go to '/register/signin'

  Scenario Outline: I fail to log in with invalid credentials
    When I type "verified@test" in the "Email" field
    And I type  "WrongPass01" in the "Password" field
    And I click the "Sign in" button
    Then I should see a "Invalid credentials" error message
  
  Scenario Outline: I fail to log in with an unverified account
    When I type "unverified@test" in the "Email" field
    And I type  "Tester01" in the "Password" field
    And I click the "Sign in" button
    Then I should see be redirected to the email validation page

  Scenario Outline: I successfully log in with a verified account and valid credentials
    When I type "verified@test" in the "Email" field
    And I type  "Tester00" in the "Password" field
    And I click the "Sign in" button
    Then I should be redirected to the dashboard page
    And I should see 'Tester' in the 'display name' field
    And I should see '26/05/2024' in the "Joined at' field

  Examples:
    name      | email                             | password  | createdAt | verified 
    Tester    | marcosandrade+crypton@gmail.com   | Tester00  | 26/05/2024| true
    Tester U. | marcosandrade+uncrypton@test.com  | Tester01  | 26/05/2024| false