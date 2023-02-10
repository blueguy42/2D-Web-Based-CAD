const canvas = document.getElementById('glcanvas');

function getCanvasPositionX(canvas, event) {
    // get canvas position x in relation to middle of x axis
    return (event.offsetX / canvas.clientWidth) * 2 - 1
}

function getCanvasPositionY(canvas, event) {
    // get canvas position y in relation to middle of y axis
    return (1 - (event.offsetY / canvas.clientHeight)) * 2 - 1;
}


canvas.addEventListener('click', function(e) {
    console.log(`x: ${getCanvasPositionX(canvas, e)} y: ${getCanvasPositionY(canvas, e)}`);
})

var allowMouseMove = true;
canvas.addEventListener('mousemove', function(e) {
    if (!allowMouseMove) return;
    allowMouseMove = false;
    console.log(`x: ${getCanvasPositionX(canvas, e)} y: ${getCanvasPositionY(canvas, e)}`);
    setTimeout(() => allowMouseMove = true, 100);

}) 
