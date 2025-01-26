/*
This code implements a simple game using the p5.js and ml5.js libraries where the player interacts with shapes using hand tracking.
The goal is to drag a white shape into a black hole by moving the index finger in front of the camera.
The game supports different shapes (circle, square, and triangle), and the player wins when the shape is successfully placed inside the hole.
*/


// Variables for capturing video and canvas dimensions
var capture;
var w = 640;
var h = 480;

// Variables for the shape and hole positions and sizes
var shapeX; // X position of the shape
var shapeY; // Y position of the shape
var shapeSize = 50; // Size of the shape
var holeX; // X position of the hole
var holeY; // Y position of the hole
var holeSize = 60; // Size of the hole
var currentShape; // Type of the current shape
var gameActive = true; // State of the game, whether it's active

// Variables for hand pose detection
let handPose;
let video;
let hands = []; // Array to hold the hand detection data

// Preload the handPose model
function preload() {
  handPose = ml5.handPose(); // Load handPose model
}

// Setup the canvas, webcam, and hand detection
function setup() {
    // Create a video capture from the webcam and hide it
    capture = createCapture({
        audio: false,
        video: {
            width: w,
            height: h
        }
    }, function() {
        console.log('capture ready.');
    });
    capture.elt.setAttribute('playsinline', ''); // Ensures the video plays inline on mobile devices
    capture.size(w, h); // Set the size of the video
    capture.hide(); // Hide the video element

    createCanvas(w, h); // Create the canvas with the same size as the video

    // Initialize the positions of the shape and hole
    newShape();

    // Start hand detection using the video
    handPose.detectStart(capture, gotHands);
}

// Draw function is called in a loop to update the canvas
function draw() {
    // Mirror the camera feed (flip horizontally)
    translate(w, 0); // Move the origin of the canvas to the right
    scale(-1, 1); // Invert the image horizontally

    // If the game is active, continue drawing
    if (gameActive) {
        image(capture, 0, 0, w, h); // Display the mirrored camera feed
        
        // Display instructions at the bottom of the screen
        push(); // Save the current canvas state
        scale(-1, 1); // Invert the text back to normal
        fill(255); // Set the text color to white
        textSize(20); // Set the text size
        textAlign(CENTER, BOTTOM); // Align the text at the center and bottom
        text("With your index finger, drag the white shape into the black hole!", -w / 2, h - 10); // Instruction text
        pop(); // Restore the canvas state

        // Draw the index finger position for each detected hand
        for (let i = 0; i < hands.length; i++) {
            let hand = hands[i];
            let keypoint = hand.keypoints[8]; // Index finger keypoint
            fill(255, 0, 0); // Red color for the fingertip
            noStroke();
            circle(keypoint.x, keypoint.y, 10); // Draw a small circle at the fingertip

            // Check if the fingertip is near the shape
            var d = dist(keypoint.x, keypoint.y, shapeX, shapeY);
            if (d < (shapeSize / 2 + 20)) { // 20 is the tolerance distance for dragging
                // Move the shape to the finger's position
                shapeX = keypoint.x;
                shapeY = keypoint.y;
            }
        }
        
        // Draw the hole according to the current shape
        drawHole();

        // Draw the shape
        drawShape();

        // Check if the shape is inside the hole
        if (isShapeInsideHole()) {
            fill(0); // Set the fill to black (indicating success)
            rect(0, 0, w, h); // Cover the screen with a black rectangle

            // Display the success message in the center of the screen
            push(); // Save the current canvas state
            scale(-1, 1); // Invert the text
            fill(255); // Set the text color to white
            textSize(64); // Set the text size
            textAlign(CENTER, CENTER); // Align the text at the center
            text("Success!", -w / 2, h / 2); // Display the success message
            pop(); // Restore the canvas state

            // Restart the game after a short delay
            setTimeout(newShape, 3000); // Wait 3 seconds before creating a new shape
            gameActive = false; // Deactivate the game
        }
    }
}

// Callback function for receiving hand pose detection data
function gotHands(results) {
    hands = results; // Save the detection results into the hands array
}

// Function to generate a new shape and hole
function newShape() {
    shapeX = random(0, w); // Randomize the X position of the shape
    shapeY = random(0, h); // Randomize the Y position of the shape
    holeX = w / 2; // Set the hole's X position in the center
    holeY = h / 2; // Set the hole's Y position in the center
    currentShape = random(['circle', 'square', 'triangle']); // Randomly choose the shape
    gameActive = true; // Activate the game
}

// Function to draw the hole based on the current shape
function drawHole() {
    fill(0); // Set the hole color to black
    if (currentShape === 'circle') {
        ellipse(holeX, holeY, holeSize, holeSize); // Draw a circular hole
    } else if (currentShape === 'square') {
        rect(holeX - holeSize / 2, holeY - holeSize / 2, holeSize, holeSize); // Draw a square hole
    } else if (currentShape === 'triangle') {
        triangle(holeX, holeY - holeSize / 2, holeX - holeSize / 2, holeY + holeSize / 2, holeX + holeSize / 2, holeY + holeSize / 2); // Draw a triangular hole
    }
}

// Function to draw the shape being moved
function drawShape() {
    stroke(0); // Set the outline color to black
    fill(255); // Set the fill color to white
    if (currentShape === 'circle') {
        ellipse(shapeX, shapeY, shapeSize, shapeSize); // Draw the circle shape
    } else if (currentShape === 'square') {
        rect(shapeX - shapeSize / 2, shapeY - shapeSize / 2, shapeSize, shapeSize); // Draw the square shape
    } else if (currentShape === 'triangle') {
        triangle(shapeX, shapeY - shapeSize / 2, shapeX - shapeSize / 2, shapeY + shapeSize / 2, shapeX + shapeSize / 2, shapeY + shapeSize / 2); // Draw the triangle shape
    }
}

// Function to check if the shape is inside the hole
function isShapeInsideHole() {
    if (currentShape === 'circle') {
        var d = dist(shapeX, shapeY, holeX, holeY); // Calculate the distance between the shape and the hole
        return d <= (holeSize / 2) - (shapeSize / 2); // Return true if the circle is inside
    } else if (currentShape === 'square') {
        return (
            shapeX - shapeSize / 2 >= holeX - holeSize / 2 &&
            shapeX + shapeSize / 2 <= holeX + holeSize / 2 &&
            shapeY - shapeSize / 2 >= holeY - holeSize / 2 &&
            shapeY + shapeSize / 2 <= holeY + holeSize / 2
        ); // Check if the square is fully inside the hole
    } else if (currentShape === 'triangle') {
        // Vertices of the triangular hole
        const holeTopY = holeY + holeSize / 2;
        const holeLeftX = holeX - holeSize / 2;
        const holeRightX = holeX + holeSize / 2;

        // Vertices of the triangular shape
        const shapeTopY = shapeY - shapeSize / 2;
        const shapeLeftX = shapeX - shapeSize / 2;
        const shapeRightX = shapeX + shapeSize / 2;

        // Return true if the triangle is inside the hole
        return (
            shapeTopY < holeTopY &&
            shapeLeftX >= holeLeftX &&
            shapeRightX <= holeRightX
        );
    }
}
