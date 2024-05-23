Feature: Registration
  Users are able to access the app's dashboard by 
  creating an account and logging in or by joining 
  as a guest with limited access.

  Scenario: Guest logs in
    Given a guest is on the home page
    When the guest clicks the 'Get realtime updates now' button
    Then the guest should be redirected to the dashboard page
    And the guest should see 'Guest' as their display name
    And the guest should see the following in the user information panel:
    * the date of registration as their 'Joined at'
    * a total of 0 unique symbols
    * a total of 0 symbols
    * a total of 0 streams
    And the guest should see a call to action to create a stream




    