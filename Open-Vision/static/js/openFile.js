//LOAD A NEW VIDEO - FILE MUST BE IN FOLDER 'video' IN THIS DIRECTORY
function openFile() {
    const video = document.getElementById('video');

    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _this => {
              let files =  Array.from(input.files);
              window.fileName = files[0]["name"];
              console.log(window.fileName);
              video.src = "./video/" + window.fileName;
          };
    input.click();
  };