// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
LSTM Generator example with p5.js
This uses a pre-trained model on a corpus of Virginia Woolf
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/lstm
=== */

let lstm;
let textInput;
let lengthSlider;
let tempSlider;
let button;
let jsondata;
let final;

function setup() {
  noCanvas();

  // Create the LSTM Generator passing it the model directory
  lstm = ml5.LSTMGenerator('./models/woolf/', modelReady);

  // Grab the DOM elements

  lengthSlider = select('#lenSlider');
  tempSlider = select('#tempSlider');
  button = select('#generate');

  // DOM element events
  //button.mousePressed(generate);
  lengthSlider.input(updateSliders);
  tempSlider.input(updateSliders);

  setInterval(checkData, 1000);
}

function checkData() {
  console.log('checking');
  jsondata = loadJSON('/all', gotData);

  function gotData(data) {
    if (data.what === 'nothing') {
      console.log('nothing');
    } else {
      console.log(data);
      //let keys = Object.keys(data);
      //console.log(data.what);
      //for (let i = 0; i < keys.length; i++) {
      textInput = data.what;
      textInput = textInput.replace(/<.*?>/g, '');
      textInput = textInput.replace(/\@(\w+)/g, '');
      generate();
    }
    //}

  }
}


// Update the slider values
function updateSliders() {
  select('#length').html(lengthSlider.value());
  select('#temperature').html(tempSlider.value());
}

function modelReady() {
  select('#status').html('Model Loaded');
}

// Generate new text
function generate() {
  // Update the status log
  select('#status').html('Generating...');

  // Grab the original text
  let original = textInput;
  // Make it to lower case
  let txt = original.toLowerCase();

  // Check if there's something to send
  if (txt.length > 0) {
    // This is what the LSTM generator needs
    // Seed text, temperature, length to outputs
    // TODO: What are the defaults?
    let data = {
      seed: txt,
      temperature: tempSlider.value(),
      length: lengthSlider.value()
    };

    // Generate text with the lstm
    lstm.generate(data, gotData);

    // When it's done
    function gotData(err, result) {
      // Update the status log
      select('#status').html('Ready!');
      final = txt + result;

      console.log(final);
      analyzeThis();
    }

    function analyzeThis() {
      let data = {

        cc: final
      }

      httpPost('/analyze', data, 'json', dataPosted, dataErr);
    }

    function dataPosted(result) {
      console.log(result);

    }

    function dataErr(err) {
      console.log(err);

    }
  }
}