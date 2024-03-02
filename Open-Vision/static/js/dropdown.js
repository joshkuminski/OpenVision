const selectElements = document.querySelectorAll('select.drop_dwn');
const A_cnt = 0;
// Add a change event listener to each select element
selectElements.forEach(select => {
    select.addEventListener('change', function() {
        let value = this.value;
        let ID = this.id;

        this.style.color = color_list[value - 1]

        // STORE SELECTION IN 'ZoneDef'
        indx = ID.split("_")[2] - 1
        ZoneDef[indx] = Number(value);

        //Try to guess the movements based on the first dropdown selection.
        if (indx == 0 && A_cnt == 0){
            A_cnt += 1;
            // CALCULATE THE MIDPOINT OF EACH ZONE SEGMENT
            let midPoints = [];
            let midPoint;
            ZoneList = ZoneList.slice(0,4);  // Just want the first 4 Zones
                for (var i = 0; i < ZoneList.length; i++) {
                    //if (i > 3){
                    //    break // ONLY INCLUDE THE FIRST 4 ZONES
                    //};
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

            for (let i = 0; i < midPoints.length; i++) {
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

            let filteredZoneList = [];
            let index = [];
            let c = 0;
            let t = 0;
            ZoneList.forEach(zone => {
                if (c < ZoneList[value - 1].quadrant){
                    filteredZoneList[t] = zone;
                    index[c] = ZoneList.findIndex((item) => item["quadrant"] == c);
                    t++;
                }
                c++;
            });

            for (let i = index.length; i > 0; i--){
                ZoneList.splice(index, 1);
            }

            //sort both lists by Quadrant
            ZoneList.sort((a, b) => a.quadrant - b.quadrant);
            filteredZoneList.sort((a, b) => a.quadrant - b.quadrant);

            filteredZoneList.forEach(zone => {
                ZoneList.push(zone);
            });
            console.log(ZoneList);

            // SET THE ENTER/EXIT ZONE DROP DOWNS
            let j = 0;
            let k = 0;
            let n = 0;
            direction = [3, 2, 1, 0];

            for (var i = 1; i < (midPoints.length * 4) + 1; i += 1) {
                let e = document.getElementById(`drop_down_${k + 1}`);
                let f = document.getElementById(`drop_down_${k + 3}`);
                e.selectedIndex = ZoneList[j].originalZone;
                f.selectedIndex = ZoneList[direction[n]].originalZone;
                e.style.color = color_list[e.value - 1];
                f.style.color = color_list[ZoneList[direction[n]].originalZone - 1];
                ZoneDef[k] = ZoneList[j].originalZone;
                ZoneDef[k + 2] = ZoneList[direction[n]].originalZone;

                // Increment Values
                k += 4;
                n += 1;
                if (i % 4 == 0){
                    j += 1;
                    n = 0;
                    move_last = direction.pop();
                    direction.splice(0, 0, move_last);
                };
            };
        };
    });
});
