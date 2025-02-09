Feature: Generate upload key

  Scenario: Successfully generate an upload key for a user
    Given a user is authenticated
    When I request to generate an upload key
    Then I should receive a 201 status code when call to generate key
    And the response should include an upload ID
