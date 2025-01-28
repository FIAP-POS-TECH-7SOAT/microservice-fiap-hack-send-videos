Feature: List videos by user ID and videos

  Scenario: Successfully retrieve videos for a valid user
    Given a user authenticated
    When I request the videos for the user
    Then I should receive a 200 status code for videos list
    And the response should include a list of videos
