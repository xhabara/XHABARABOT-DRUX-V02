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
const scale_factor = 0.5;



// Preload drum sounds
function preload() {
  const drumNames = ["RullyShabaraSampleR1.wav", "RullyShabaraSampleR2.wav", "RullyShabaraSampleR3.wav", "RullyShabaraSampleR4.wav"];
  drumNames.forEach((name, idx) => drumSounds[idx] = loadSound(name));
}

function setup() {
  // Apply the scaling factor to the canvas dimensions
  createCanvas(windowWidth * 0.8 * scale_factor, windowHeight * 0.8 * scale_factor);

  // Create pads and initialize the currentStep array
  pads.push(...Array.from({ length: 4 }, (_, i) => new Pad(i, scale_factor)));
  currentStep.push(...Array.from({ length: 4 }, () => 0));

let buttonY = height * 0.7;  
  let buttonSpacing = 60;  
  
  syncButton = new SyncButton(scale_factor);
  syncButton.x = width / 2.35;
  syncButton.y = buttonY;
 
  
  
  
  randomizeButton = createButton('Randomize Manually')
    .position(width / 3 - buttonSpacing, buttonY)
    .mousePressed(randomizeSequence)
    .addClass('randomize-btn')
    .style('font-size', '7px')
    .style('padding', '5px 10px');  // Smaller padding
  
  autonomousButton = createButton('Xhabarabot Mode')
    .position(width / 2.5 + buttonSpacing, buttonY)
    .mousePressed(toggleAutonomousMode)
    .addClass('autonomous-btn')
    .style('font-size', '8px')
    .style('padding', '5px 10px');
  
  // Initialize recorder and soundFile
  recorder = new p5.SoundRecorder();
  soundFile = new p5.SoundFile();

  // Create and style the record button
recordButton = createButton('Start Recording');
  recordButton.position(230 * scale_factor, 370 * scale_factor)
              .mousePressed(toggleRecording)
              .addClass('record-btn')
              .style('font-size', `${25 * scale_factor}px`)
              .style('padding', `${7 * scale_factor}px ${15 * scale_factor}px`);
  
  gain = new p5.Gain();
  gain.connect();
  recorder.setInput(gain);
}

function draw() {
  background(45, 45, 50);
  pads.forEach(pad => pad.display());
  syncButton.display();

  // Scaled down text size for mobile view
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(8);
  text(`${tempo} BPM`, width * 0.08, height * 0.02);
}

function playStep(step, padIndex) {
  drumSounds[step]?.disconnect();  // Disconnect from master output
  drumSounds[step]?.connect(gain); // Connect to gain node instead
  drumSounds[step]?.play();
  gain.amp(0.5);  // Set gain amount, adjust this to your liking
}


// Randomize sequence function
function randomizeSequence() {
  pads.forEach(pad => {
    pad.sequence = Array.from({ length: floor(random(1, 9)) }, () => floor(random(0, 8)));
  });
}

class Pad {
  constructor(soundIndex, scale_factor) {
    this.soundIndex = soundIndex;
    this.x = (width / 2.8) * (soundIndex + 1) * scale_factor;
    this.y = height * 0.3 * scale_factor;
    this.width = (width / 5) * scale_factor;
    this.height = (height / 3) * scale_factor;
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

class SyncButton {
  constructor(scale_factor) {
    this.x = (width / 2 - 60) * scale_factor;
    this.y = (height * 0.8) * scale_factor;
    this.width = 100 * scale_factor;
    this.height = 50 * scale_factor;
    this.isSynced = false;
  }

  display() {
    noStroke();
    fill(this.isSynced ? '#00ff00' : '#ff0000');
    rect(this.x, this.y, this.width, this.height, 9);
   
    fill(25);
    textSize(8);
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

