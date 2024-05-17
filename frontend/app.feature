Feature: Guest mode
 
  Scenario: User logs as guest for the first time
   Given that the user is on the home page
   When the user clicks the "Get realtime updates now" button
   Then the user should be redirected to the dashboard page
   And the user should see the current date as their join date
   And the user should see a zeroed total of unique symbols, total symbols and total streams
   And the user should see a CTA to create a stream

  Scenario: User opens and closes stream creation modal
   Given that the user is on the dashboard page
   When the user clicks the "Create" button
   Then the user should be redirected to the stream creation page
   And the user should see the available crypto currency pairs
   And the user should see a disabled button to create a stream
   Then the user clicks the "Cancel" button to close the modal
   And the user should be redirected to the dashboard page
