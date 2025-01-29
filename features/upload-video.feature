Feature: Upload Video
  As an authenticated user
  I want to upload a video to the system
  So that it can be processed and stored

  Scenario: Successfully upload a video
    Given I am authenticated with a valid token
    And I have a video file named "test-video.mp4"
    When I send a POST request to "/videos/send" with the video file
    Then I should receive a 201 status code
    And the message should be "The video is being uploaded and we will inform you of the next statuses!"
