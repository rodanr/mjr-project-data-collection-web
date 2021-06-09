const recordButton = $("#recordButton");
const stopButton = $("#stopButton");
const submitButton = $("#submitButton");
const nextButton = $("#nextButton");
const finishButton = $("#finishButton");
let audioPlayer = $("#audioPlayer");
let recorder;
function toggleButtons(record, stop, submit, next, finish) {
  // send true to the respecting parameter name to turn on the button
  //toggling all buttons based on the variable values
  recordButton.prop("disabled", !record);
  stopButton.prop("disabled", !stop);
  submitButton.prop("disabled", !submit);
  nextButton.prop("disabled", !next);
  finishButton.prop("disabled", !finish);
}
function startRecording() {
  //toggling unecessary buttons
  toggleButtons(false, true, false, false, false);
  //starting record
  recorder.start();
}
function stopRecording() {
  //toggling buttons
  toggleButtons(true, false, true, false, false);
  recorder.stop();
}

function playAudio(audioBlob) {
  audioPlayer.attr("src", URL.createObjectURL(audioBlob.data));
  audioPlayer[0].play();
}

function submitAudio() {
  //toggling buttons
  toggleButtons(true, false, false, true, true);
  alert("Audio Submitted Successfully");
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
}
