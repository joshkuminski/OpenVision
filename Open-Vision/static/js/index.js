//Set the canvas properties - need fabric.js
let canvas = new fabric.Canvas('canvas',{
    background: null,
});


document.addEventListener('DOMContentLoaded', ()=>{
    let player = document.getElementById('video');
    player.addEventListener('canplay', (ev)=>{
        console.log('canplay',
        ev.target.videoWidth,
        ev.target.videoHeight);
    })
});


let line;
let mouseDown = false;
let click_event;
let count = 0;
let color;
let color_str;
let pad = 20;
let color_list = [];
let color_list_save = [];
let color_dict = [];
let StartZone = [];
let ZoneList = [];
let ZoneDef = Array(64).fill(0);

//add a disable class when button is click so it cant be clicked a second time
//document.getElementById(".edit_btn").addClass('disabled');

//set the button id to a variable 'addingLineBtn'
let addingLineBtn = document.getElementById("adding-line-btn");
addingLineBtn.addEventListener('click', activateAddingLine);


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
};


function startAddingLine(o){
    mouseDown = true;
    click_event = 1;
    let  pointer = canvas.getPointer(o.e);

    color = [getRandomInt(255), getRandomInt(255), getRandomInt(255)]; 
    color_str = `rgb(${color[0]},${color[1]},${color[2]})`;
    color_list.push(color_str);
    color_list_save.push(color);

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


function log_coords(x, y, click_event){
    if (click_event == 1){
        StartZone = [x, y];
    };
    if (click_event == 2){
        ZoneList.push([StartZone,[x, y]]);
    };
};


function  SaveData(id){
    // Create a new Date object
    const now = new Date();

    // Display a prompt dialog for user input
    const userInput_project = window.prompt("Please enter a Project Name: \ni.e. Location");
    const userInput_run = window.prompt("Please enter a Run Name: \ni.e. start time of recording or date");
    // Check if the user clicked "OK" and entered a value
    if (userInput_project.length != 0 && userInput_run.length != 0) {
        alert("Project Name: " + userInput_project + "\nRun Name: " + userInput_run);
    } else {
        alert("No input provided.");
        return;
    }

    // Get the current time
    const hours = now.getHours(); // 0-23
    const minutes = now.getMinutes(); // 0-59
    const seconds = now.getSeconds(); // 0-59
    let current_time = `${hours}:${minutes}:${seconds}`;
    let split_time = current_time.split(':');
    current_time = split_time[0] + '_' + split_time[1] + '_' + split_time[2];

    //Save the data to JSON files
    let data = ZoneList;
    let name = "Zone_Data";
    CreateDownload(current_time, data, name);

    //alert("<-- Click Allow Multiple Downloads");

    data = color_list_save;
    name = "Color_Data";
    CreateDownload(current_time, data, name);

    data = [window.fileName, userInput_project, userInput_run];
    name = "Filename";
    CreateDownload(current_time, data, name);

    data = ZoneDef;
    name = "Zone_Def_Data";
    CreateDownload(current_time, data, name);

    data = Mask;
    name = "Mask_Data";
    CreateDownload(current_time, data, name);

    //alert("Image Saved to static/img/image_clone.jpg");
};


function  CreateDownload(current_time, data, name){
    // Convert the data to JSON
    const jsonData = JSON.stringify(data);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `${name}_${current_time}.json`;

    // Trigger a click event to download the file
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
};
