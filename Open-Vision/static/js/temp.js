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