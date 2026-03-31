import { respondToAudio } from "./audioCutter.js";

const recordButton = document.getElementById('record-button');

const chunks = [];

export function initAudioRecorder(recorder) {

    recordButton.addEventListener('click', () => {
        toggleRecording(recorder);
    });

    recorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        createAudioElement(blob);
        
        console.log('recorder stopped');
    });

    recorder.addEventListener('dataavailable', (e) => {
        chunks.push(e.data);
    })
}

function toggleRecording(mediaRecorder) {
    if (mediaRecorder.state == 'inactive') {
        mediaRecorder.start();
        console.log("recorder started");
        recordButton.style.background = "red";
        recordButton.style.color = "black";
        return;
    }

    endRecording(mediaRecorder);
}

function endRecording(mediaRecorder) {
    mediaRecorder.stop();
    console.log("recorder stopped");
    recordButton.style.background = "";
    recordButton.style.color = "";
}

function createAudioElement(blob) {
    const body = document.querySelector('body');

    const audio = document.createElement("audio");
    audio.controls = true;
    const audioURL = window.URL.createObjectURL(blob);
    audio.src = audioURL;

    const respondButton = document.createElement("button");
    respondButton.innerText = 'Reageer';
    respondButton.classList.add('respond-button');
    respondButton.addEventListener('click', (e) => respondToAudio(e))

    const audioContainer = document.createElement("div");
    audioContainer.classList.add('audio-container');
    
    audioContainer.appendChild(audio);
    audioContainer.appendChild(respondButton);
    body.appendChild(audioContainer);
}
