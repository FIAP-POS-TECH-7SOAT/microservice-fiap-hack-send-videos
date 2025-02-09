Feature: Get missing parts for a video upload

  Scenario: Successfully retrieve missing parts for a video upload
    Given a user is authenticated to get missing parts
    When I request to get missing parts for the video
    Then I should receive a 200 status code when requesting missing parts
    And the response should include missing parts information
