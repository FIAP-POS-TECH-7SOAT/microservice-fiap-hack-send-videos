Feature: Upload parts of a video
  As a user
  I want to upload video parts to the server
  So that I can upload large video files in smaller chunks

  Scenario: Successfully upload a part of a video
    Given I am authenticated with a valid token to call a video part enpoint
    And I have a video file part named "test-video-part.mp4"
    And the request body contains:
      | part_number | 1          |
      | upload_id   | "upload123"  |
      | total_parts | 5          |
      | file_name   | "test-video.mp4"  |
    When I send a POST request to "/videos/send-part" with the video part
    Then I should receive a 201 status code from video part endpoint
    And the response from video part endpoint should include:
      | upload_id | "upload123" |
      | next_part | 2              |
