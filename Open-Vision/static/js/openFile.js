//LOAD A NEW VIDEO - FILE MUST BE IN FOLDER 'video' IN THIS DIRECTORY
function openFile() {
    const video = document.getElementById('video');
    const image = document.getElementById('image');

    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _this => {
              let files =  Array.from(input.files);
              window.fileName = files[0]["name"];
              window.imgName = files[0]["name"].split('.')[0];
              console.log(window.fileName);
              console.log(window.imgName);
              video.src = "./video/" + window.fileName;
              image.src = "./static/img/" + window.imgName + ".jpg";
          };
    input.click();
  };