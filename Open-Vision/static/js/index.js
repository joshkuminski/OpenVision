//Set the canvas properties - need fabric.js
let canvas = new fabric.Canvas('canvas',{
    background: null,
});

let line;
let mouseDown = false;
let click_event;
let count = 0;
let color;
let color_str;
let pad = 20;
let color_list = [];
let color_dict = [];
let StartZone = [];
let ZoneList = [];
let ZoneDef = Array(64).fill(0);

//add a disable class when button is click so it cant be clicked a second time
//document.getElementById(".edit_btn").addClass('disabled');

//set the button id to a variable 'addingLineBtn'
let addingLineBtn = document.getElementById("adding-line-btn");
addingLineBtn.addEventListener('click', activateAddingLine);

//create random int
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
};


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

    data = color_list;
    name = "Color_Data";
    CreateDownload(current_time, data, name);

    data = window.fileName;
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


// Find the select element(s) with the class "drop_dwn"
const selectElements = document.querySelectorAll('select.drop_dwn');
// Add a change event listener to each select element
selectElements.forEach(select => {
    select.addEventListener('change', function() {
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
});


function calculateMidpoint(x1, y1, x2, y2) {
    const midpointX = (x1 + x2) / 2;
    const midpointY = (y1 + y2) / 2;
    return { x: midpointX, y: midpointY };
};
