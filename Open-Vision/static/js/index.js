//let width = $("#video")[0].width;
//let height = $("#video")[0].height;
//Set the canvas properties - need fabric.js
let canvas = new fabric.Canvas('canvas',{
    background: null,
});

//add a disable class when button is click so it cant be clicked a second time
$('.edit_btn').addClass('disabled');

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



const button = document.getElementById('drawButton');

button.addEventListener('click', drawLines);

function drawLines() {
    // Clear the canvas
    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define the original line's starting and ending points
    const startX = 50;
    const startY = 100;
    const endX = 300;
    const endY = 100;

    // Draw the original line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Calculate the length of the original line
    const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

    // Calculate the unit vector in the direction of the original line
    const unitX = (endX - startX) / length;
    const unitY = (endY - startY) / length;

    // Calculate the perpendicular line's starting and ending points (same length)
    const perpStartX = endX;
    const perpStartY = endY;
    const perpEndX = perpStartX + unitY * length;
    const perpEndY = perpStartY - unitX * length;

    // Draw the perpendicular line
    ctx.beginPath();
    ctx.moveTo(perpStartX, perpStartY);
    ctx.lineTo(perpEndX, perpEndY);
    ctx.stroke();

    // Calculate the position for the second perpendicular line (1/4 of the length)
    const secondPerpX = perpStartX + unitX * (length / 4);
    const secondPerpY = perpStartY + unitY * (length / 4);

    // Draw the second perpendicular line
    ctx.beginPath();
    ctx.moveTo(secondPerpX, secondPerpY);
    ctx.lineTo(secondPerpX - unitY * length, secondPerpY + unitX * length);
    ctx.stroke();
}





//set the button id to a variable 'addingLineBtn'
let addingLineBtn = document.getElementById("adding-line-btn");
let addingMaskBtn = $("#mask-btn")[0];

//Call the function 'activateAddingLine' When button is pressed
addingLineBtn.addEventListener('click', activateAddingLine);
//addingMaskBtn.addEventListener('click', activateAddingMask);
addingMaskBtn.addEventListener('click', activateMask);

// Get the canvas element
const mask_canvas = document.getElementById('mask_canvas');
mask_canvas.width=1280;
mask_canvas.height=720;
const ctx = mask_canvas.getContext('2d');

// Create an empty array to store the polygon vertices
let vertices = [];
let Mask = [];

function activateMask(){
    //canvas.style.zIndex = "-1"; // Set canvas1 to be on top
    mask_canvas.style.zIndex = '1'; // Set canvas2 to be behind canvas

    if (vertices.length > 0){
        Mask.push({vertices});
        console.log(Mask)
        vertices = [];
    }
};


   // Event listener for mouse click
  mask_canvas.addEventListener('click', function(event) {
  // Get the coordinates of the click relative to the canvas
  const rect = mask_canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Add the vertex to the array
  vertices.push({ x, y });
  // Clear the canvas
  ctx.clearRect(0, 0, mask_canvas.width, mask_canvas.height);

  // Draw the polygon
  drawPolygon();
});

// Function to draw the polygon
function drawPolygon() {
    if (Mask.length > 0){
        //Draw the New Polygon
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        // Draw lines to the remaining vertices
        for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.closePath();
        // Set the stroke color and fill style
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        // Draw the polygon
        ctx.stroke();
        ctx.fill();

        //Draw the Existing Polygons
        for (let j = 0; j < Mask.length; j++){

            ctx.beginPath();
            // Move to the first vertex
            ctx.moveTo(Mask[j].vertices[0].x, Mask[j].vertices[0].y);
            // Draw lines to the remaining vertices
            for (let i = 1; i < Mask[j].vertices.length; i++) {
            ctx.lineTo(Mask[j].vertices[i].x, Mask[j].vertices[i].y);
            }
            ctx.closePath();

            // Set the stroke color and fill style
            ctx.strokeStyle = 'red';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';

            // Draw the polygon
            ctx.stroke();
            ctx.fill();
            }
        }
    else{
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        // Draw lines to the remaining vertices
        for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        // Close the path
        ctx.closePath();

        // Set the stroke color and fill style
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';

        // Draw the polygon
        ctx.stroke();
        ctx.fill();
        }
}

//create random int
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


//TODO: allow add click only once
function activateAddingLine(){
    //clear out the list if button is not disabled
    if (addingLineBtn.disabled === false){
        //console.log('refresh list');
    }
    
    //add a disable class when button is click so it cant be clicked a second time
    //$('.btn').addClass('disabled');

    //Add event listeners
    canvas.on('mouse:down', startAddingLine);
    canvas.on('mouse:move', startDrawingLine);
    canvas.on('mouse:up', stopDrawingLine);

    //canvas.off('mouse:down', startAddingRect);
    //canvas.off('mouse:move', startDrawingRect);
    //canvas.off('mouse:up', stopDrawingRect);

    canvas.selection = false;
}


let line;
let mouseDown = false;
let click_event;
let count = 0;
let color;
let color_str;
let pad = 20;
let color_list = [];
let color_dict = [];

function startAddingLine(o){
    mouseDown = true;
    click_event = 1;
    let  pointer = canvas.getPointer(o.e);

    color = [getRandomInt(255), getRandomInt(255), getRandomInt(255)]; 
    color_str = `rgb(${color[0]},${color[1]},${color[2]})`;
    color_list.push(color_str);

    //color_list.append(color_str);
    line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: color_str,
        strokeWidth: 5,
    });

    let circle = new fabric.Circle({
        radius: 10,
        fill: color_str,
        left: pointer.x - 10,
        top: pointer.y - 10,
        selectable: false
    });

    canvas.add(line);
    canvas.add(circle);
    canvas.requestRenderAll();
    log_coords(pointer.x, pointer.y, click_event);
};

function startDrawingLine(o){
    if (mouseDown === true){
        let  pointer = canvas.getPointer(o.e);

        line.set({
            x2: pointer.x,
            y2: pointer.y
        });

        canvas.requestRenderAll();
    }

};

function stopDrawingLine(o){
    count = count + 1;

    //Create dictionay of colors : zones {key : value}
    color_dict.push({'color': color_str,
                    'zone' : count}
                    );

    let  pointer = canvas.getPointer(o.e);
    click_event = 2;
    mouseDown = false;
    log_coords(pointer.x, pointer.y, click_event);
    line_center_x = (line.x1 + line.x2) / 2 - 20;
    line_center_y = (line.y1 + line.y2) / 2 - 20;

    let circle = new fabric.Circle({
        radius: 20,
        fill: color_str,
        left: line_center_x,
        top: line_center_y,
        selectable: false
    });
    let circle2 = new fabric.Circle({
        radius: 10,
        fill: color_str,
        left: pointer.x - 10,
        top: pointer.y - 10,
        selectable: false
    });

    let zone_num = count.toString();
    let text = new fabric.Text(zone_num, { 
        textAlign: "center",
        left: line_center_x + 13, 
        top: line_center_y + 5,
        stroke: 'white',
        fontSize: 30,
        fill: 'white'
        });
    canvas.add(circle2);
    canvas.add(circle);
    canvas.add(text);
    canvas.renderAll();

    //Create a DropDownList element.
    let ddID = document.getElementsByClassName("drop_dwn");
    //let ddID = document.getElementById("drop_down");
    //Add the Options to the DropDownList.

    for (var i = 0; i < ddID.length; i++) {
        let option = document.createElement("OPTION");
        //Set Customer Name in Text part.
        option.innerHTML = "Zone " + zone_num;
        //Set CustomerId in Value part.
        option.value = count;
        option.style.color = color_str;

        //Add the Option element to DropDownList.
        ddID[i].options.add(option);
    }

};

function activateAddingMask(){
    //clear out the list if button is not disabled
    if (addingMaskBtn.disabled === false){
        //console.log('refresh list');
    }

    //add a disable class when button is click so it cant be clicked a second time
    $('.mask_btn').addClass('disabled');

    //Add event listeners
    canvas.on('mouse:down', startAddingRect);
    canvas.on('mouse:move', startDrawingRect);
    canvas.on('mouse:up', stopDrawingRect);

    canvas.off('mouse:down', startAddingLine);
    canvas.off('mouse:move', startDrawingLine);
    canvas.off('mouse:up', stopDrawingLine);

    canvas.selection = false;
};

//let csvContent = "data:text/csv;charset=utf-8,";
let StartZone = [];
let ZoneList = [];
let ZoneDef = Array(64).fill(0);

function log_coords(x, y, click_event){
    if (click_event == 1){
        StartZone = [x, y];
    };
    if (click_event == 2){
        ZoneList.push([StartZone,[x, y]]);
    };
};


//let csvFileData = ZoneList;   
//create a user-defined function to download CSV file   
function  SaveData(id){
    // Create a new Date object
    const now = new Date();

    // Get the current time
    const hours = now.getHours(); // 0-23
    const minutes = now.getMinutes(); // 0-59
    const seconds = now.getSeconds(); // 0-59
    let current_time = `${hours}:${minutes}:${seconds}`;
    let split_time = current_time.split(':');
    current_time = split_time[0] + '_' + split_time[1] + '_' + split_time[2];

    const data = ZoneList;

    // Convert the data to JSON
    const jsonData = JSON.stringify(data);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `data_${current_time}.json`;

    // Trigger a click event to download the file
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
    
    SaveZones(current_time);
    SaveColors(current_time);
    SaveFileName(current_time);
    //alert("Image Saved to static/img/image_clone.jpg");
};

function  SaveZones(current_time){
    const data = ZoneDef

    // Convert the data to JSON
    const jsonData = JSON.stringify(data);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `zone_data_${current_time}.json`;

    // Trigger a click event to download the file
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
};

function  SaveColors(current_time){
    const data = color_list

    // Convert the data to JSON
    const jsonData = JSON.stringify(data);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `color_data_${current_time}.json`;

    // Trigger a click event to download the file
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
};

function  SaveFileName(current_time){
    const data = window.fileName

    // Convert the data to JSON
    const jsonData = JSON.stringify(data);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `FileName_${current_time}.json`;

    // Trigger a click event to download the file
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
};

$('select[class="drop_dwn"]').change(function(){
    let value = this.value;
    let ID = this.id;

    this.style.color = color_list[value - 1]

    // STORE SELECTION IN 'ZoneDef'
    indx = ID.split("_")[2] - 1
    ZoneDef[indx] = Number(value);

   //Auto populate the rest of the drop down boxes when NBR is changed
    if (indx == 0){
        // Define the starting point - mid point of the NB Zone line
        let startPoint = ZoneList[value - 1]
        startPoint = calculateMidpoint(startPoint[0][0],startPoint[0][1],startPoint[1][0],startPoint[1][1]);

        // Define an array of points (modify with your specific points)
        let endPoint = [];
        let midpoint;
        for (var i = 0; i < ZoneList.length; i++) {
            if (i > 3){
                break // ONLY INCLUDE THE FIRST 4 ZONES
            };
            midPoint = calculateMidpoint(ZoneList[i][0][0],ZoneList[i][0][1],ZoneList[i][1][0],ZoneList[i][1][1]);
            endPoint.push(midPoint);
        };

        // Calculate the angle of each point relative to the starting point
        endPoint.forEach(point => {
            point.angle = Math.atan2(point.y - startPoint.y, point.x - startPoint.x);
            point.index = endPoint.indexOf(point)
        });

        // delete angle = 0
        let noPoint = endPoint;
        endPoint = endPoint.filter(point => point.angle !== 0);
        // Sort the points in clockwise order based on their angles
        endPoint.sort((a, b) => a.angle - b.angle);
        noPoint.sort((a, b) => a.angle - b.angle);
        console.log(noPoint);
        console.log(endPoint);

        //SET THE DROP DOWN BOXES
        let j = 0
        let k = 0
        if (value == 3){
            //IF ZONE FURTHEST TO THE RIGHT OF THE SCREEN IS NB - THEN THE ALGORITHM BELOW DOESNT WORK.
            lastVal = endPoint.pop()
            endPoint.splice(0, 0, lastVal);
            console.log(endPoint);
        };

        // SET THE ENTER ZONE DROP DOWNS
        for (var i = 0; i < (((endPoint.length + 1) * 4) + 1); i += 1) {
            if (i < 4){
                let e = document.getElementById(`drop_down_${k + 1}`);
                e.selectedIndex = value;
                e.style.color = color_list[e.value - 1];
                k += 4;
                ZoneDef[k + 1] = Number(value);
             }
            else{
                if (i == 4){
                    k -= 4;
                }
                k += 4;

                let e = document.getElementById(`drop_down_${k + 1}`);
                e.selectedIndex = endPoint[j].index + 1;
                e.style.color = color_list[e.value - 1];
                ZoneDef[k + 1] = endPoint[j].index + 1;

                if (i == 4){
                    i += 1
                }
                else{
                    if (i % 4 == 0){
                        j += 1;
                        };
                    };
                };
        };


         // SET THE REST OF THE DROP DOWNS
        let t = 2
        let r;
        if (value == 1){
            r = 1;
        };
        if (value == 2){
            r = 0;
        };
        if (value == 3){
            r = 2;
        };
        if (value == 4){
            r = 3;
        };

        if (value == 3){
            //IF ZONE FURTHEST TO THE RIGHT OF THE SCREEN IS NB - THEN THE ALGORITHM BELOW DOESNT WORK.
        }
        else{
            for (var i = 0; i < 60; i += 4) {
            //console.log(i / 16)
            if (i ==12 || i == 28 || i == 44){
                // SKIP THE u TURNS
                t = 2;
                // Add the 'R'th element of 'noPoint' to 'endPoint'
                endPoint.push(noPoint[r]);
                //Remove the first element
                endPoint.shift();
                // Remove the r'th element
                noPoint.splice(r, 1);
                if ((value == 3 && i ==28) || (value == 3 && i == 12)){
                    r = 2;
                }
                else if (value == 3 && i == 44){
                    r = 1;
                }
                else{
                    r = 0;
                };

            }
            else{
                //console.log(t, i)
                let e = document.getElementById(`drop_down_${i + 1}`);
                let f = document.getElementById(`drop_down_${i + 3}`);
                f.selectedIndex = endPoint[t].index + 1;
                f.style.color = color_list[e.value - 1];
                ZoneDef[i + 3] = endPoint[t].index + 1;
                t -= 1;
                };
            };
        };

    };

});

function calculateMidpoint(x1, y1, x2, y2) {
    const midpointX = (x1 + x2) / 2;
    const midpointY = (y1 + y2) / 2;
    return { x: midpointX, y: midpointY };
};
