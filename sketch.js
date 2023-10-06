const drumSounds = [];
const pads = [];
let tempo = 120;
const currentStep = [];
let syncButton;
let randomizeButton;
let autonomousButton;
let autonomousMode = false;
let recorder, soundFile;
let isRecording = false;
let recordButton;
let gain;


// Preload drum sounds
function preload() {
  const drumNames = ["RullyShabaraSampleR1.wav", "RullyShabaraSampleR2.wav", "RullyShabaraSampleR3.wav", "RullyShabaraSampleR4.wav"];
  drumNames.forEach((name, idx) => drumSounds[idx] = loadSound(name));
}

function setup() {
  createCanvas(windowWidth * 0.8, windowHeight * 0.55);
  pads.push(...Array.from({ length: 4 }, (_, i) => new Pad(i)));
  currentStep.push(...Array.from({ length: 4 }, () => 0));

   let buttonY = height * 0.5;  // Centralized Y position
  let buttonSpacing = 136;  // Space between buttons
  
  syncButton = new SyncButton();
  syncButton.x = width / 2.5;  // Center the syncButton
  syncButton.y = buttonY;

  randomizeButton = createButton('Randomize Manually')
    .position(width / 3.5 - buttonSpacing, buttonY)
    .mousePressed(randomizeSequence)
    .addClass('randomize-btn');
  
  autonomousButton = createButton('Xhabarabot Mode')
    .position(width / 2.7 + buttonSpacing, buttonY)
    .mousePressed(toggleAutonomousMode)
    .addClass('autonomous-btn');
  
  // Initialize recorder and soundFile
recorder = new p5.SoundRecorder();
soundFile = new p5.SoundFile();

// Create and style the record button
recordButton = createButton('Record');
recordButton.position(240, 350);  
recordButton.mousePressed(toggleRecording);
recordButton.addClass('record-btn');
  
  gain = new p5.Gain();
gain.connect();
recorder.setInput(gain);


}

// Draw function
function draw() {
  background(45, 45, 50);
  pads.forEach(pad => pad.display());
  syncButton.display();

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(6);
  text(`${tempo} BPM`, width * 0.07, height * 0.97);
}

function playStep(step, padIndex) {
  drumSounds[step]?.disconnect();  // Disconnect from master output
  drumSounds[step]?.connect(gain); // Connect to gain node instead
  drumSounds[step]?.play();
  gain.amp(0.5);  


// Randomize sequence function
function randomizeSequence() {
  pads.forEach(pad => {
    pad.sequence = Array.from({ length: floor(random(1, 9)) }, () => floor(random(0, 8)));
  });
}

// Pad class
class Pad {
  constructor(soundIndex) {
    this.soundIndex = soundIndex;
    this.x = (width / 6) * (soundIndex + 1);
    this.y = height * 0.1;
    this.width = width / 7;
    this.height = height / 3;
    this.sequence = [this.soundIndex];
    this.isPlaying = false;
    this.isSynced = false;
  }

  display() {
    fill(this.isPlaying ? 'rgb(255, 200, 0)' : 80);
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

// SyncButton class
class SyncButton {
  constructor() {
    this.x = width / 2 - 50;
    this.y = height * 0.8;
    this.width = 100;
    this.height = 30;
    this.isSynced = false;
  }

  display() {
    noStroke();
    fill(this.isSynced ? '#00ff00' : '#ff0000');
    rect(this.x, this.y, this.width, this.height, 7);
    textAlign(CENTER, CENTER);
    fill(25);
    textSize(10);
    text(this.isSynced ? 'CHANGE' : 'RETURN', this.x + this.width / 2, this.y + this.height / 2);
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

  if (syncButton.isClicked(mouseX, mouseY)) {
    syncButton.toggleSync();
  }
}

// Key press handling
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

// Change tempo function
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

  
  if (random() < 0.2) {
    changeTempo(tempo + random(-10, 10));
  }

  
  if (random() < 0.1) {
    syncButton.toggleSync();
  }

  
  if (random() < 0.05) {
    randomizeSequence();
  }

  setTimeout(autonomousBehavior, random(200, 1000)); // Adjust timing as desired
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

