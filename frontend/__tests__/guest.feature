Feature: Guest mode
  I want to preview crypton's features with a guest account

  Scenario: I log in with a guest account
    Given I am on the home page
    When I click the 'Get realtime updates now' button
    Then I should be redirected to the dashboard page
    And I should see 'Guest' in the 'display name' field
    And I should see the following in the user information panel:
    * the date of registration as my 'Joined at'
    * a total of 0 unique symbols
    * a total of 0 symbols
    * a total of 0 streams
    And I should see a call to action to create a stream
  




    