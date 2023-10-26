import cv2
import os

# Specify the folder containing video files
video_folder = "./Open-Vision/video"

# Create a folder to save the images
output_folder = "./Open-Vision/static/img"

# List all video files in the specified folder
video_files = [f for f in os.listdir(video_folder) if f.endswith((".mp4", ".avi"))]

# Loop through each video file and save a frame as an image
for video_file in video_files:
    video_path = os.path.join(video_folder, video_file)

    # Open the video file
    cap = cv2.VideoCapture(video_path)
    frame_number = 50
    # Set the current frame to the desired frame number
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    # Check if the video file was successfully opened
    if not cap.isOpened():
        print(f"Error: Could not open {video_file}")
        continue

    # Read the first frame
    ret, frame = cap.read()

    # Check if the frame was successfully read
    if ret:
        # Save the frame as an image
        image_file = os.path.splitext(video_file)[0] + ".jpg"
        image_path = os.path.join(output_folder, image_file)
        cv2.imwrite(image_path, frame)
        print(f"Saved frame from {video_file} as {image_file}")
    else:
        print(f"Error: Could not read frame from {video_file}")

    # Release the video capture object
    cap.release()

print("Image extraction completed.")
