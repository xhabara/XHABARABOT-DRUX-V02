const drumSounds = [];
const pads = [];
let tempo = 120;
const currentStep = [];
let syncButton;
let randomizeButton;
let autonomousButton;
let autonomousMode = false;

// Preload drum sounds
function preload() {
  const drumNames = ["RullyShabaraSampleR1.wav", "RullyShabaraSampleR2.wav", "RullyShabaraSampleR3.wav", "RullyShabaraSampleR4.wav"];
  drumNames.forEach((name, idx) => drumSounds[idx] = loadSound(name));
}

// Setup function
function setup() {
  createCanvas(windowWidth * 0.5, windowHeight * 0.35);
  pads.push(...Array.from({ length: 4 }, (_, i) => new Pad(i)));
  currentStep.push(...Array.from({ length: 4 }, () => 0));

  syncButton = new SyncButton();
  randomizeButton = createButton('Randomize Manually')
    .position(width / 2.3 - 45, height * 0.68)
    .mousePressed(randomizeSequence)
    .addClass('randomize-btn');
  
  autonomousButton = createButton('Xhabarabot Mode')
    .position(width / 4.5 + 60, height * 0.55)
    .mousePressed(toggleAutonomousMode)
    .addClass('autonomous-btn');
}

// Draw function
function draw() {
  background(45, 45, 50);
  pads.forEach(pad => pad.display());
  syncButton.display();

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(3);
  text(`${tempo} BPM`, width * 0.07, height * 0.97);
}

// Play step function
function playStep(step, padIndex) {
  drumSounds[step]?.play();
}

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

  // Randomly change tempo
  if (random() < 0.2) {
    changeTempo(tempo + random(-10, 10));
  }

  // Randomly synchronize
  if (random() < 0.1) {
    syncButton.toggleSync();
  }

  // Randomly randomize sequences
  if (random() < 0.05) {
    randomizeSequence();
  }

  setTimeout(autonomousBehavior, random(200, 1000)); // Adjust timing as desired
}
