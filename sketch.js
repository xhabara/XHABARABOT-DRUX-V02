// Styling constants 
const hackerGreen = '#0f0';
const matrixBlack = '#000';
const consoleFont = 'monospace';
const glowEffect = '0 0 10px #0f0';

// Initialize the necessary arrays and objects
let drumSounds = []; // Array for storing drum sounds
let pads = []; // Array for storing pad objects
let tempo = 120; // Initial tempo
let currentStep = []; // Array to keep track of current steps in sequences
let syncButton, randomizeButton, autonomousButton; // Button objects
let autonomousMode = false; // Flag for autonomous mode
let recorder, soundFile; // Objects for recording functionality
let isRecording = false; // Flag for recording state
let recordButton; // Button object for recording
let gain; // Gain node for audio manipulation
let refreshButton;

// Preload drum sounds
function preload() {
  const drumNames = ["RullyShabaraSampleR1.wav", "RullyShabaraSampleR2.wav", "RullyShabaraSampleR3.wav", "RullyShabaraSampleR4.wav"];
  drumSounds = drumNames.map(name => loadSound(name)); // Load and assign drum sounds
}

function setup() {
  createCanvas(310, 330).style('background-color', matrixBlack); // Matrix-style background

  // Create pads and initialize the currentStep array
  for (let i = 0; i < 4; i++) {
    pads.push(new Pad(i));
    currentStep[i] = 0;
  }

  // Create and style buttons
syncButton = createButton('CHANGE').mousePressed(toggleSync);
  styleButton(syncButton, 230, 170);
  syncButton.mouseOver(() => hoverButton(syncButton));
  syncButton.mouseOut(() => styleButton(syncButton, 230, 170));


  autonomousButton = createButton('XHABARABOT MODE').mousePressed(() => toggleButton(autonomousButton, toggleAutonomousMode));
  styleButton(autonomousButton, 30, 210);

  recordButton = createButton('RECORD').mousePressed(() => toggleButton(recordButton, toggleRecording));
  styleButton(recordButton, 30, 265);
  
 randomizeButton = createButton('RANDOMIZE').mousePressed(randomizeSequence);
  styleButton(randomizeButton, 30, 170);
  randomizeButton.mouseOver(() => hoverButton(randomizeButton));
  randomizeButton.mouseOut(() => styleButton(randomizeButton, 30, 170));
  randomizeButton.addClass('highlighted'); 

  // Event listeners for HTML buttons
  document.getElementById("tempo-up").addEventListener("click", () => changeTempo(tempo + 10));
  document.getElementById("tempo-down").addEventListener("click", () => changeTempo(tempo - 10));

  // Set up the audio recording infrastructure
  gain = new p5.Gain();
  gain.connect();
  recorder = new p5.SoundRecorder();
  recorder.setInput(gain);
  soundFile = new p5.SoundFile();
  
refreshButton = createButton('REFRESH')
    .position(225, 265) 
    .style('font-family', consoleFont)
    .style('background-color', matrixBlack)
    .style('color', hackerGreen)
    .style('border', `1px solid ${hackerGreen}`)
    .style('text-shadow', glowEffect)
    .style('padding', '5px 10px')
    .style('cursor', 'pointer')
    .mousePressed(refreshCanvas);
}

function highlightButton(button) {
  button.style('background-color', '#0f0'); // Green background
  button.style('color', '#000'); // Black text
}

function draw() {
  background(matrixBlack); 
  pads.forEach(pad => pad.display());
  
  // Scaled down text size for mobile view
  textAlign(CENTER, CENTER);
  fill(hackerGreen);
  textSize(8);
  text(`${tempo} BPM`, width * 0.08, height * 0.02);
}
 
function initializeButtons() {
  
  syncButton = new SyncButton(0.5);  

  randomizeButton = createButton('RANDOMIZE').mousePressed(function() {
    randomizeSequence();
    provideClickFeedback(this);
  });
  styleHackerButton(randomizeButton, 30, 200);

  autonomousButton = createButton('XHABARABOT MODE').mousePressed(function() {
    toggleAutonomousMode();
    provideClickFeedback(this);
  });
  styleHackerButton(autonomousButton, 200, 200);

  recordButton = createButton('RECORD').mousePressed(function() {
    toggleRecording();
    provideClickFeedback(this);
  });
  styleHackerButton(recordButton, 30, 265);

  syncButton = createButton('CHANGE').mousePressed(() => {
    
  });
  styleHackerButton(syncButton, 135, 175, 60, 30);



}

function toggleButton(button, action) {
  button.elt.classList.toggle('active'); // Toggle 'active' class on the button
  action(); // Call the button's respective function
}

function toggleSync() {
  
  pads.forEach(pad => pad.setSync(!pad.isSynced));
}

function playStep(step, padIndex) {
  drumSounds[step]?.disconnect();  // Disconnect from master output
  drumSounds[step]?.connect(gain); // Connect to gain node instead
  drumSounds[step]?.play();
  gain.amp(0.5);  
}


// Randomize sequence function
function randomizeSequence() {
  pads.forEach(pad => {
    pad.sequence = Array.from({ length: floor(random(1, 9)) }, () => floor(random(0, 8)));
  });
  randomizeButtonColor = [random(255), random(255), random(255)];
}

function styleButton(button, x, y) {
  button.position(x, y);
  button.style('font-family', consoleFont);
  button.style('background-color', matrixBlack);
  button.style('color', hackerGreen);
  button.style('border', `1px solid ${hackerGreen}`);
  button.style('text-shadow', glowEffect);
  button.style('font-size', '10px');
  button.style('padding', '5px 10px');
}

// New function for hover effect
function hoverButton(button) {
  button.style('background-color', '#555'); 
  button.style('color', '#fff'); // White text
}

class Pad{
  constructor(soundIndex) {
    this.soundIndex = soundIndex;
    this.x = 20 + (70 * soundIndex);  // Start at 20, then add 70 for each new pad
    this.y = 70;  
    this.width = 60;  
    this.height = 60;
    this.sequence = [this.soundIndex];
    this.isPlaying = false;
    this.isSynced = false;
  }

 display() {
    fill(this.isPlaying ? 'rgb(0, 255, 0)' : 'rgb(50, 50, 50)');
    rect(this.x, this.y, this.width, this.height, 5);
  }


  isClicked(x, y) {
    return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
  }

  startLoop() {
    this.isPlaying = true;
    this.playNextStep();
  }

  stopLoop() {
    this.isPlaying = false;
  }

  setSync(isSynced) {
    this.isSynced = isSynced;
  }

  playNextStep() {
    if (this.isPlaying) {
      playStep(this.sequence[currentStep[this.soundIndex]], this.soundIndex);
      currentStep[this.soundIndex] = (currentStep[this.soundIndex] + 1) % this.sequence.length;
      setTimeout(() => this.playNextStep(), 60000 / tempo / (this.isSynced ? 1 : 2));
    }
  }
}

class SyncButton {
  constructor(scale_factor) {
    this.x = (width / 2 - 60) * scale_factor;
    this.y = (height * 0.8) * scale_factor;
    this.width = 100 * scale_factor;
    this.height = 50 * scale_factor;
    this.isSynced = false;
  }

  display() {
    fill(this.isSynced ? hackerGreen : '#ff0000');
    rect(this.x, this.y, this.width, this.height, 10);
    fill(matrixBlack);
    textSize(10);
    text(this.isSynced ? 'SYNCED' : 'UNSYNC', this.x + this.width / 2, this.y + this.height / 2);
  
}

  isClicked(x, y) {
    return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
  }

  toggleSync() {
    this.isSynced = !this.isSynced;
    pads.forEach(pad => pad.setSync(this.isSynced));
  }
}



// Mouse click handling
function mouseClicked() {
  pads.forEach(pad => {
    if (pad.isClicked(mouseX, mouseY)) {
      pad.isPlaying ? pad.stopLoop() : pad.startLoop();
    }
  });

 
  if (syncButton instanceof SyncButton && syncButton.isClicked(mouseX, mouseY)) {
    syncButton.toggleSync();
  }
}


function keyPressed() {
  const playSteps = {
    "1": () => playStep(0, 0),
    "2": () => playStep(1, 1),
    "3": () => playStep(2, 2),
    "4": () => playStep(3, 3),
  };

  const upperKey = key.toUpperCase();

  if (playSteps[upperKey]) {
    playSteps[upperKey]();
  } else if (keyCode === UP_ARROW) {
    changeTempo(tempo + 10);
  } else if (keyCode === DOWN_ARROW) {
    changeTempo(tempo - 10);
  }
}
function changeTempo(newTempo) {
  tempo = constrain(newTempo, 30, 300);
}
function toggleAutonomousMode() {
  autonomousMode = !autonomousMode;
  autonomousButton.html(autonomousMode ? 'Stop Xhabarabot Mode' : 'Xhabarabot Mode');
  if (autonomousMode) {
    randomizeButton.attribute('disabled', ''); // Disable randomize button
  } else {
    randomizeButton.removeAttribute('disabled'); // Enable randomize button
  }
  if (autonomousMode) {
    autonomousBehavior();
  }
}

function autonomousBehavior() {
  if (!autonomousMode) return;

  let randomPad = random(pads);
  randomPad.isPlaying ? randomPad.stopLoop() : randomPad.startLoop();

  // Randomly change tempo
  if (random() < 0.2) {
    changeTempo(tempo + random(-10, 10));
  }

 

  // Randomly randomize sequences
  if (random() < 0.05) {
    randomizeSequence();
  }

  setTimeout(autonomousBehavior, random(200, 1000)); 
}

function toggleRecording() {
  if (!isRecording) {
    recorder.record(soundFile);
    recordButton.html('Stop Recording');
    isRecording = true;
  } else {
    recorder.stop();
    recordButton.html('Download');
    soundFile.save('XhabarabotDrux.wav');
    isRecording = false;
  }
}

function refreshCanvas() {
  // Refresh the page
  window.location.reload();
}
