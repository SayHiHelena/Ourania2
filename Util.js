// calculate distance
function distance(x1, y1, x2, y2){
    return sqrt(sq(x1-x2) + sq(y1-y2));
}

function mapPosition(keypoint){
    let mapX = map(keypoint.position.x, 0, video.width, width, 0);
    let mapY = map(keypoint.position.y, 0, video.height, 0, height);
    return createVector(mapX, mapY);
}