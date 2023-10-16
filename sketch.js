/* Pose key points
////////////////////////////////////////////////////
0	nose
1	leftEye
2	rightEye
3	leftEar
4	rightEar
5	leftShoulder
6	rightShoulder
7	leftElbow
8	rightElbow
9	leftWrist
10	rightWrist
11	leftHip
12	rightHip
13	leftKnee
14	rightKnee
15	leftAnkle
16	rightAnkle
////////////////////////////////////////////////////
*/

// pose net
let video;
let poseNet;
let poses = [];
let noseAttractor = [];
// let skeletons = [];
let img;
let figureimg;
let vid;

let silhouetteGraphic;

// Add Kinectron local address here
let kinectron; 

// TODO
// 多人
// 深度检测 距离超过threshold后缓慢汇集 越近越强
// 人影轮廓？how?
// 亮度 数量的变化 - 明暗对比



// https://editor.p5js.org/zickzhao1994/sketches/S3r3IxukQ
// https://www.youtube.com/watch?v=MJNy2mdCt20

var trails = [];
var highlights = [];
var SCREEN_SIZE;

const COL_PALETTE = [
  [48,50,77], // dark blue
  [66, 87, 132],
  [56,60,112],
  [21, 8, 50],
  [21,58,159],
  [75, 75, 157],
];
const HIGH_PALETTE = [
  [244,253,173], // light yellow
  [244,200,173]
];

var nums = 500;
var highlightNum = 50;
var noiseScale = 500; // large number - zoom in
var radius = 3;

function modelReady() {
    console.log("Model Loaded");
}

function preload() {
  img = loadImage('assets/testBg.jpg');
  // figureimg = loadImage('assets/figure.png');
  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(21, 8, 50);
  silhouetteGraphic = createGraphics(windowWidth, windowHeight);
  vid = createVideo(["assets/galaxy.mp4"]);
  vid.size(width, height);
  vid.loop();
  vid.hide();

  noStroke();

   /////////////////
  // Kinectron
  // https://kinectron.github.io/#/api/windows
  kinectron = new Kinectron("192.168.1.115")

  // For Azure Kinect use "azure"
  // kinectron.setKinectType("azure");
  // For Kinect for Windows use "windows"
  kinectron.setKinectType("windows");

  // Connect with application over peer
  kinectron.makeConnection();

  // Set callbacks
  // kinectron.setColorCallback(drawFeed);
  kinectron.setDepthCallback(drawFeed);
  // kinectron.setRawDepthCallback(drawFeed);
  // kinectron.setTrackedBodiesCallback(drawFeed);
  // kinectron.setBodiesCallback(drawFeed);
  // kinectron.setInfraredCallback(drawFeed);
  // kinectron.setLeInfraredCallback(drawFeed);
  // kinectron.setKeyCallback(drawFeed);
  // kinectron.setRGBDCallback(drawFeed);

  // kinectron.setDepthCallback(drawFeed);

  /////////////////


  SCREEN_SIZE = min(width, height);
  for (let i = 0; i < nums; i++) {
    trails[i] = new Trail(COL_PALETTE, false);
  }

  for (let i = 0; i < highlightNum; i++) {
    highlights[i] = new Trail(HIGH_PALETTE, true);
  }

  // pose detection
  // capture video source
  // video = createCapture(VIDEO);
  // // Create a new poseNet object and listen for pose detection results
  // poseNet = ml5.poseNet(video, modelReady);
  // poseNet.on("pose", (results) => {
  //     poses = results;
  // });
  // // Hide the video element
  // video.hide();
}

function drawFeed(img) {
  console.log(kinectron);

function draw() {
  if(frameCount%10 == 0) {
    silhouetteGraphic = createGraphics(windowWidth, windowHeight);
    silhouetteGraphic.noStroke();
    silhouetteGraphic.fill(244,253,173);
  }
  
  let vidFrame = vid.get();
  tint(255,50);
  image(vidFrame, 0, 0, width, height);


    // option 1: dim down
    // if(frameCount % 10 == 0) {
    //   background(21, 8, 50, 15);
      
    // }
    
    // push();
    // translate(width/2, height/2);
    // rotate(frameCount/300);
    // tint(255, 15); 
    // image(img, -width/2, -height/2, width, height * 2);
    // pop();
  
    push();
    // mapNose(); // pose net

    // Draw the skeletons
    for (let i = 0; i < poses.length; i++) {
      
      // drawSkeleton(poses[i]);
      drawSilhouette(poses[i]);
    }
    pop();

  
    let closestPt;

    if(noseAttractor != null) {
      closestPt = noseAttractor[0];
    }

    // draw blue stars
    for (let i = 0; i < trails.length; i++) {
      trails[i].update(closestPt);
      trails[i].display();
      
      trails[i].checkRecreate();
    }
    
    
    // draw highlight stars
   for (let i = 0; i < highlights.length; i++) {
      // let minDis = max(width, height);
      // for (let j = 0; j < noseAttractor.length; j++) {
      //     let distance = dist(
      //         highlights[i].pos.x,
      //         highlights[i].pos.y,
      //         noseAttractor[j].x,
      //         noseAttractor[j].y
      //     );
      //     if (distance < minDis) {
      //         minDis = distance;
      //         closestPt = noseAttractor[j];
      //     }
          
      // }
    highlights[i].update(closestPt);
    highlights[i].display();
    
    highlights[i].checkRecreate();

    }

    


    // tint(255, 4); 
    // image(silhouetteGraphic, 0,0);
    // console.log("drawing graphic canvas");
}


function drawSilhouette(figure) {
  if(figure){
    // fill(244,253,173);
    // stroke(244,253,173);

    let pose = figure.pose;

    const nose = pose.keypoints[0];
    const leftEye = pose.keypoints[1];
    const rightEye = pose.keypoints[2];
    const leftWrist = pose.keypoints[9];
    const rightWrist = pose.keypoints[10];

    let mapNose = mapPosition(nose);
    let mapLeftEye = mapPosition(leftEye);
    let mapRightEye = mapPosition(rightEye);

    let headStdSize = distance(mapLeftEye.x, mapLeftEye.y, mapRightEye.x, mapRightEye.y);


    silhouetteGraphic.push();
      silhouetteGraphic.translate(mapNose.x, mapNose.y);
      let angle = atan2(mapLeftEye.y - mapRightEye.y, mapLeftEye.x - mapRightEye.x);
      silhouetteGraphic.rotate(angle);
      silhouetteGraphic.ellipse(0,0,headStdSize * 2, headStdSize * 2.5);
    silhouetteGraphic.pop();
    silhouetteGraphic.ellipse(mapNose.x, mapNose.y + headStdSize * 4,headStdSize * 3, headStdSize * 5);
    console.log("drawing silhouette");

    // Draw the lines between keypoints to create the skeleton
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      let mapX = map(x, 0, video.width, width, 0);
      let mapY = map(y, 0, video.height, 0, height);
      
      ellipse(mapX,mapY,10,10);
      
    }
  }
  
}

function drawSkeleton(figure) {
  if(figure){

    fill(244,253,173, 2);
    let pose = figure.pose;
    let skeleton = figure.skeleton;

    const leftEye = pose.keypoints[1];
    const rightEye = pose.keypoints[2];
    const leftWrist = pose.keypoints[9];
    const rightWrist = pose.keypoints[10];
    // Draw the lines between keypoints to create the skeleton
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      let mapX = map(x, 0, video.width, width, 0);
      let mapY = map(y, 0, video.height, 0, height);
      
      ellipse(mapX,mapY,50,50);
      
    }
    
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      let ax = map(a.position.x, 0, video.width, width, 0);
      let ay = map(a.position.y, 0, video.height, 0, height);
      let bx = map(b.position.x, 0, video.width, width, 0);
      let by = map(b.position.y, 0, video.height, 0, height);
      strokeWeight(50);
      stroke(244,253,173, 2);
      line(ax, ay,bx,by);      
    }
  }
  
}

// extract all the detected nose keypoints into an array
function mapNose() {
    noseAttractor = [];
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i += 1) {
        // For each pose detected, find the nose keypoint
        const pose = poses[i].pose;

        const nose = pose.keypoints[0];
        if (nose.score > 0.5) {
          fill(255, 0, 0, 100);
          noStroke();
          // flip horizontally so it's mirroring the movement
          let mapX = map(nose.position.x, 0, video.width, width, 0);
          let mapY = map(nose.position.y, 0, video.height, 0, height);

          noseAttractor.push(createVector(mapX, mapY));

          ellipse(mapX, mapY, 10, 10);
          tint(255, 5); 
          // image(figureimg, mapX-100,mapY-100);
          // image(figureimg, mapX-200,mapY-100);
      }

      //   const leftWrist = pose.keypoints[9];
      //   const rightWrist = pose.keypoints[10];
      //   if (leftWrist.score > 0.5) {
      //       fill(0);
      //       noStroke();
      //       // flip horizontally so it's mirroring the movement
      //       let mapX = map(leftWrist.position.x, 0, video.width, width, 0);
      //       let mapY = map(leftWrist.position.y, 0, video.height, 0, height);
      //       ellipse(mapX, mapY, 10, 10);
      //   }
      //   if (rightWrist.score > 0.5) {
      //     fill(0);
      //     noStroke();
      //     let mapX = map(rightWrist.position.x, 0, video.width, width, 0);
      //     let mapY = map(rightWrist.position.y, 0, video.height, 0, height);
      //     ellipse(mapX, mapY, 10, 10);
      // }
    }
}

