import cv2


def check_empty_video_frames(filename):
    video = cv2.VideoCapture(filename)

    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    empty_frames = []

    for i in range(frame_count):
        ret, frame = video.read()

        # Check if the frame is empty (no data)
        if frame is None:
            empty_frames.append(i)

    video.release()

    if len(empty_frames) == 0:
        print("All frames have data in the video.")
    else:
        print("Empty frames found at indices:", empty_frames)


def check_blank_video_frames(filename):
    video = cv2.VideoCapture(filename)

    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    blank_frames = []

    # Read the first frame to use as a blank frame for comparison
    ret, blank_frame = video.read()

    for i in range(frame_count):
        ret, frame = video.read()

        # Compare the current frame with the blank frame
        try:
            difference = cv2.absdiff(frame, blank_frame)
            grayscale_diff = cv2.cvtColor(difference, cv2.COLOR_BGR2GRAY)
            _, threshold_diff = cv2.threshold(grayscale_diff, 30, 255, cv2.THRESH_BINARY)

            # Check if the thresholded difference image is blank
            if cv2.countNonZero(threshold_diff) == 0:
                blank_frames.append(i)

        except Exception as e:
            print("Error occurred during frame processing:", str(e), "frame number :", i)
            blank_frames.append(i)

    video.release()

    if len(blank_frames) == 0:
        print("All frames have an image and are not blank.")
    else:
        print("Blank frames found at indices:", blank_frames)

    return blank_frames


def delete_frame_from_video(input_file, output_file, frame_number):
    video = cv2.VideoCapture(input_file)

    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

    # Check if the specified frame number is valid
    if frame_number >= frame_count:
        print("Invalid frame number.")
        return

    # Create a VideoWriter object to save the modified video
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = video.get(cv2.CAP_PROP_FPS)
    frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
    output = cv2.VideoWriter(output_file, fourcc, fps, (frame_width, frame_height))

    current_frame = 0

    while current_frame < frame_count:
        ret, frame = video.read()

        # Skip the frame to be deleted
        if current_frame == frame_number:
            current_frame += 1
            continue

        # Write the frame to the output video
        output.write(frame)

        current_frame += 1

    video.release()
    output.release()

    print("Frame deleted successfully.")

# Specify the path to your input video file
input_file = 'C:/Users/hsojh/PycharmProjects/OpenVision/Open-Vision/video/EXAMPLE.mp4'

# Specify the path to the output video file (without the frame to be deleted)
output_file = 'C:/Users/hsojh/PycharmProjects/OpenVision/Open-Vision/video/EXAMPLE_new.mp4'

# Call the function to check the video frames
frame_number = check_blank_video_frames(input_file)

for frame in frame_number:
    # Call the function to delete the frame from the video
    delete_frame_from_video(input_file, output_file, frame)

# Call the function to check the video frames
#check_empty_video_frames(filename)
