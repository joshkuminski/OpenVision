import os
import shutil
import json

# When the tracking is completed move these files to a folder with the Project Name.
# When the same Project is run with a different RunName then check if this folder exists, if not then run this file.

# GET THE FILES FROM DOWNLOAD FOLDER AND PLACE IN /InputFiles
def get_last_n_files(folder_path, extension):
    # Get a list of files in the folder sorted by modification time
    try:
        files = sorted(
            [f for f in os.listdir(folder_path) if f.endswith(extension)],
            key=lambda x: os.path.getmtime(os.path.join(folder_path, x)),
            reverse=True
        )

        for file in files:
            file = folder_path + '/' + file
            dest_folder = './Input_Data/'
            new_file = dest_folder + file.split('/')[-1]
            shutil.copy2(file, dest_folder)
            os.remove(file)  # remove files from download folder
            with open('{}'.format(new_file), 'r') as f:
                split_file = new_file.split('/')[-1]
                if split_file.split('_')[0] == 'Filename':
                    Filename = json.load(f)
                    ProjectName = Filename[1]
                    RunName = Filename[2]
            f.close()

        #os.makedirs('./Open-Vision/data/{}/'.format(ProjectName), exist_ok=True)
        with open('./Input_Data/ProjectName.txt'.format(ProjectName), 'w') as text_file:
            text_file.write(ProjectName)
        text_file.close()
        with open('./Input_Data/RunName.txt'.format(ProjectName), 'w') as text_file:
            text_file.write(RunName)
        text_file.close()

    except Exception as e:
        print('no json files found')


downloads_folder = os.path.expanduser("~") + "/Downloads"
extension = '.json'

if __name__ == "__main__":
    get_last_n_files(downloads_folder, extension)
