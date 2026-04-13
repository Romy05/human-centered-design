import { respondToAudio } from "./audioCutter.js";

let chunks = [];
let originalAudioBlob = null;
let pauseTime = null;

export function initAudioRecorder(recorder) {
    recorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        createAudioElement(originalAudioBlob, blob);
    });

    recorder.addEventListener('dataavailable', (e) => {
        chunks.push(e.data);
    })
}

export function startRecording(recorder, audioElement) {
    chunks = [];
    pauseTime = audioElement.currentTime;
    originalAudioBlob = audioElement.src;
    recorder.start();

    const recordStartAudio = new Audio('public/audio/start-recording.mp3');
    setTimeout(() => recordStartAudio.play(), 500);
}

export function handleShortCut(event, mediaRecorder, audioElement) {
    if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (mediaRecorder.state === 'inactive') {
            audioElement.pause();
            startRecording(mediaRecorder, audioElement);
            console.log("recorder started");
        } else {
            mediaRecorder.stop();
            console.log("recorder stopped");
            setTimeout(() => audioElement.play(), 1000);
        }
    }
}

async function createLayeredMonoAudio(originalSrc, recordedBlob, contextDuration = 5) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const originalResponse = await fetch(originalSrc);
    const originalArrayBuffer = await originalResponse.arrayBuffer();

    const originalBuffer = await audioCtx.decodeAudioData(originalArrayBuffer);
    const recordedBuffer = await audioCtx.decodeAudioData(await recordedBlob.arrayBuffer());

    const sampleRate = originalBuffer.sampleRate;
    const pauseFrame = Math.floor(pauseTime * sampleRate);
    const contextStartFrame = Math.max(0, pauseFrame - contextDuration * sampleRate);
    const contextFrames = pauseFrame - contextStartFrame;

    const totalFrames = contextFrames + recordedBuffer.length;
    const finalBuffer = audioCtx.createBuffer(1, totalFrames, sampleRate);
    const finalData = finalBuffer.getChannelData(0);

    const contextSnippet = originalBuffer.getChannelData(0).slice(contextStartFrame, pauseFrame);
    
    // Plak de context aan het begin (index 0)
    finalData.set(contextSnippet, 0);

    // 4. Kopieer de reactie direct na de context
    const reactionData = recordedBuffer.getChannelData(0);
    finalData.set(reactionData, contextFrames);

    return finalBuffer;
}

// Voeg beide blobs toe als parameters
async function createAudioElement(originalBlob, recordedBlob) {
    const body = document.querySelector('body');

    // Maak de gelaagde audio buffer
    const layeredBuffer = await createLayeredMonoAudio(originalBlob, recordedBlob);

    // Converteer de AudioBuffer naar een Blob zodat je hem in een <audio> tag kunt zetten
    const layeredBlob = audioBufferToBlob(layeredBuffer);

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = window.URL.createObjectURL(layeredBlob);

    const respondButton = document.createElement("button");
    respondButton.innerText = 'Reageer';
    respondButton.classList.add('respond-button');
    respondButton.addEventListener('click', (e) => respondToAudio(e));

    const audioContainer = document.createElement("div");
    audioContainer.classList.add('audio-container');

    audioContainer.appendChild(audio);
    audioContainer.appendChild(respondButton);
    body.appendChild(audioContainer);
}


// Dit heb ik met behulp van Claude AI gedaan

// Hulpfunctie: AudioBuffer → Blob (WAV-formaat)
function audioBufferToBlob(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const dataLength = audioBuffer.length * numChannels * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV-header schrijven
    const writeString = (offset, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Audio data schrijven (float32 → int16)
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }

    return new Blob([buffer], { type: 'audio/wav' });
}
