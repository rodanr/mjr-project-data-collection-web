//initializing
const recordButton = $("#recordButton");
const stopButton = $("#stopButton");
const submitButton = $("#submitButton");
const nextButton = $("#nextButton");
const finishButton = $("#finishButton");
const fileNameHolder = $("#fileNameHolder");
const ws = new WebSocket("ws://localhost:3000/");
let audioPlayer = $("#audioPlayer");
let audioBlobGlobal;
let recorder, audioURL;
function toggleButtons(record, stop, submit, next, finish) {
  // send true to the respecting parameter name to turn on the button
  //toggling all buttons based on the variable values
  recordButton.prop("disabled", !record);
  stopButton.prop("disabled", !stop);
  submitButton.prop("disabled", !submit);
  nextButton.prop("disabled", !next);
  finishButton.prop("disabled", !finish);
}
function toggleFileNameHolder(show) {
  if (show === true) {
    fileNameHolder.css("display", "block");
  } else {
    fileNameHolder.css("display", "none");
  }
}
function startRecording() {
  //toggling unnecessary buttons
  toggleButtons(false, true, false, false, false);
  //not showing filename
  toggleFileNameHolder(false);
  //starting record
  recorder.start();
}
function stopRecording() {
  //toggling buttons
  toggleButtons(true, false, true, false, false);
  toggleFileNameHolder(true); //showing filename
  recorder.stop();
}

function playAudio(audioBlob) {
  audioBlobGlobal = audioBlob;
  audioPlayer.attr("src", URL.createObjectURL(audioBlobGlobal.data));
  audioURL = window.URL.createObjectURL(audioBlobGlobal.data);
  fileName = fileNameHolder.text();
  $("#downloadButton").attr("href", audioURL);
  $("#downloadButton").attr("download", `${fileName}`);
  audioPlayer[0].play();
}

function submitAudio() {
  //toggling buttons
  toggleButtons(true, false, false, true, true);
  ws.send(audioBlobGlobal.data);
}

if (navigator.mediaDevices) {
  //Getting mic access
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    }) //Mic input is passed through stream
    .then((stream) => {
      //Setting MediaRecorder to record the Mic input Stream
      recorder = new MediaRecorder(stream);
      //when data is available it calls playAudio function passing the audio blob as a parameter
      recorder.ondataavailable = playAudio;
    });

  recordButton.click(startRecording);
  stopButton.click(stopRecording);
  submitButton.click(submitAudio);
  finishButton.click(() => (window.location.href = "/thanks"));
  nextButton.click(() => location.reload()); //refreshing the page to get new text to read and get new filename
}
