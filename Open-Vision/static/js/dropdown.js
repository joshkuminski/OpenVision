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

        // CALCULATE THE MIDPOINT OF EACH ZONE SEGMENT
        let midPoints = [];
        let midPoint;
            for (var i = 0; i < ZoneList.length; i++) {
                if (i > 3){
                    break // ONLY INCLUDE THE FIRST 4 ZONES
                };
                midPoint = calculateMidpoint(ZoneList[i][0][0],ZoneList[i][0][1],ZoneList[i][1][0],ZoneList[i][1][1]);
                midPoints.push(midPoint);
            };

        // CALCULATE THE CENTER OF THE ZONE BOX
        // Initialize variables to store the smallest and largest values and their index
        let smallestX = ZoneList[0][0][0];
        let smallestY = ZoneList[0][0][1];
        let largestX = ZoneList[0][0][0];
        let largestY = ZoneList[0][0][1];
        let smallestIndex_X = [0, 0];
        let smallestIndex_Y = [0, 0];
        let largestIndex_X = [0, 0];
        let largestIndex_Y = [0, 0];

        for (let i = 0; i < ZoneList.length; i++) {
            for (let j = 0; j < 2; j++){ //start and end point
                if (ZoneList[i][j][0] < smallestX) {
                    smallestX = ZoneList[i][j][0];
                    smallestIndex_X = [i, j];
                }
                if (ZoneList[i][j][1] < smallestY) {
                    smallestY = ZoneList[i][j][1];
                    smallestIndex_Y = [i, j];
                }
                if (ZoneList[i][j][0] > largestX) {
                    largestX = ZoneList[i][j][0];
                    largestIndex_X = [i, j];
                }
                if (ZoneList[i][j][1] > largestY) {
                    largestY = ZoneList[i][j][1];
                    largestIndex_Y = [i, j];
                }
            }
        };

        // Construct the line segments:
        segment1 = [{x: ZoneList[smallestIndex_X[0]][smallestIndex_X[1]][0], y: ZoneList[smallestIndex_X[0]][smallestIndex_X[1]][1]},
                     {x: ZoneList[largestIndex_X[0]][largestIndex_X[1]][0], y: ZoneList[largestIndex_X[0]][largestIndex_X[1]][1]}];
        segment2 = [{x: ZoneList[smallestIndex_Y[0]][smallestIndex_Y[1]][0], y: ZoneList[smallestIndex_Y[0]][smallestIndex_Y[1]][1]},
                     {x: ZoneList[largestIndex_Y[0]][largestIndex_Y[1]][0], y: ZoneList[largestIndex_Y[0]][largestIndex_Y[1]][1]}];

        const intersection = calculateLineSegmentIntersection(segment1, segment2);

        // DETERMINE THE QUADRANT THAT THE MIDPOINTS LIE
        let quad;
        let q = 0;
        midPoints.forEach(point => {
            ZoneList[q].originalZone = q + 1;
            quad = [{x: (intersection.x - point.x), y: (intersection.y - point.y)}];
            if (quad[0].x > 0 && quad[0].y > 0){
                ZoneList[q].quadrant = 0;
            }
            if (quad[0].x < 0 && quad[0].y > 0){
                ZoneList[q].quadrant = 1;
            }
            if (quad[0].x < 0 && quad[0].y < 0){
                ZoneList[q].quadrant = 2;
            }
            if (quad[0].x > 0 && quad[0].y < 0){
                ZoneList[q].quadrant = 3;
            }
            q++;
        });
        console.log(ZoneList);

        let filteredZoneList = [];
        let c = 0;
        let t = 0;
        ZoneList.forEach(zone => {
            console.log(ZoneList[value - 1].quadrant);
            if (c < ZoneList[value - 1].quadrant){
                //filteredZoneList[t] = ZoneList[c];
                filteredZoneList[t] = zone;
                ZoneList.splice(c, 1);
                t++;
            }
            c++;
        });
        console.log(ZoneList);
        console.log(filteredZoneList);

        //sort both lists by Quadrant
        ZoneList.sort((a, b) => a.quadrant - b.quadrant);
        filteredZoneList.sort((a, b) => a.quadrant - b.quadrant);

        filteredZoneList.forEach(zone => {
            ZoneList.push(zone);
        });
        console.log(ZoneList);

        // MOVE SELECTED TO THE FRONT OF THE LINE - ***will only work once right now
        //const shift = ZoneList[value - 1];
        //ZoneList.splice(value - 1, 1);
        //ZoneList.unshift(shift);

        // SET THE ENTER ZONE DROP DOWNS
        let j = 0
        let k = 0
        if (indx == 0){
            for (var i = 0; i < (((midPoints.length + 1) * 4) + 1); i += 1) {
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
                e.selectedIndex = midPoints[j].quadrant;
                e.style.color = color_list[e.value - 1];
                ZoneDef[k + 1] = midPoints[j].quadrant;

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
        };




    });
});
