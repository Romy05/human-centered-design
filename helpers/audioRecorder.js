import { pressPlayButton, pressTranscribeButton } from "../index.js";

let chunks = [];
let originalAudioBlob = null;
let pauseTime = null;

export function initAudioRecorder(recorder) {
    let transcript = '';
    const recognition = new SpeechRecognition();

    recognition.addEventListener('result', (e) => {
        transcript = e.results[0][0].transcript;
    });

    recorder.addEventListener('start', () => {
        recognition.start();
    })
    recorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        createAudioMessage(originalAudioBlob, blob, transcript);
    });

    recorder.addEventListener('pause', () => {
        chunks = [];
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
    console.log(event);
    const escapeKeyPressed = event.key === 'Escape';
    const startKeyPressed = event.altKey && event.shiftKey && event.key.toLowerCase() === 's';
    const stopKeyPressed = event.key === ' ' || event.key === 'Enter' || startKeyPressed;

    if (mediaRecorder.state === 'inactive' && startKeyPressed) {
        event.preventDefault();
        audioElement.pause();
        startRecording(mediaRecorder, audioElement);
        console.log("recorder started");
    } else if (mediaRecorder.state === 'recording' && stopKeyPressed) {
        event.preventDefault();
        mediaRecorder.stop();
        console.log("recorder stopped");
        const recordEndAudio = new Audio('public/audio/end-recording.mp3');
        recordEndAudio.play();
        setTimeout(() => audioElement.play(), 1000);
    } else if (mediaRecorder.state === 'recording' && escapeKeyPressed) {
        mediaRecorder.pause();
        console.log('recording deleted');
        const recordQuitAudio = new Audio('public/audio/quit-recording.mp3');
        recordQuitAudio.play();
        setTimeout(() => audioElement.play(), 2500);
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
    
    finalData.set(contextSnippet, 0);

    const reactionData = recordedBuffer.getChannelData(0);
    finalData.set(reactionData, contextFrames);

    return finalBuffer;
}

// Voeg beide blobs toe als parameters
async function createAudioMessage(originalBlob, recordedBlob, transcript) {
    const messageContainer = document.querySelector('.messages');

    // Maak de gelaagde audio buffer
    const layeredBuffer = await createLayeredMonoAudio(originalBlob, recordedBlob);

    // Converteer de AudioBuffer naar een Blob zodat je hem in een <audio> tag kunt zetten
    const layeredBlob = audioBufferToBlob(layeredBuffer);

    const audio = document.createElement("audio");
    audio.src = window.URL.createObjectURL(layeredBlob);
    const audioDuration = await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', () => resolve(audio.duration));
    });

    const playButton = document.createElement('button');
    playButton.setAttribute('aria-label', 'speel spraakbericht af');
    playButton.classList.add('play-button');
    playButton.innerHTML = `<div class="icon">
                            <img class="icon-pause" src="./public/images/pause-button.png">
                            <img class="icon-play" src="./public/images/play-button.png">
                        </div>
                        <div class="audio-visual" style="--animation-duration: ${audioDuration}s"></div>`;
    playButton.addEventListener('click', pressPlayButton);

    const transcribeButton = document.createElement('button');
    transcribeButton.textContent = 'Transcribeer';
    transcribeButton.classList.add('transcribe');
    transcribeButton.addEventListener('click', pressTranscribeButton);

    const transcriptText = document.createElement('p');
    transcriptText.classList.add("empty");
    transcriptText.classList.add('transcript');
    transcriptText.setAttribute('data-text-content', transcript)
  
    const audioContainer = document.createElement("div");
    audioContainer.classList.add('audio-container');

    const message = document.createElement('div');
    message.classList.add('audio-message');

    audioContainer.appendChild(playButton);
    audioContainer.appendChild(audio);
    audioContainer.appendChild(transcribeButton);
    audioContainer.appendChild(transcriptText);
    message.appendChild(audioContainer);
    messageContainer.appendChild(message);
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
