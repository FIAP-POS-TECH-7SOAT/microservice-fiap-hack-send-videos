Feature: Get last part of uploaded video

  Scenario: Successfully retrieve last part information for a valid video and user
    Given a video file "test-video.mp4" and user authenticated
    When I request the last part for the video file
    Then I should receive a 200 status code for last part
    And the response should include the upload ID and part number
