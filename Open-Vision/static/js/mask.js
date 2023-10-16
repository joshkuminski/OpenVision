let addingMaskBtn = document.getElementById("mask-btn");

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