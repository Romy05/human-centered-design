import { initAudioRecorder } from "./helpers/audioRecorder.js";
import { respondToAudio } from "./helpers/audioCutter.js";

if (navigator.mediaDevices) {
    const constraints = { audio: true };

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            const recorder = new MediaRecorder(stream);
            initAudioRecorder(recorder);
        });
}

const respondButtons = document.querySelectorAll('.respond-button');

respondButtons.forEach(button => button.addEventListener('click', (e) => respondToAudio(e)));

const playAudioButtons = document.querySelectorAll('.play-button');

playAudioButtons.forEach(button => button.addEventListener('click', (e) => {
    e.target.nextElementSibling.play();
}));

// Het volgende stuk heb ik laten genereren door AI. Ik ben van plan om hier nog wijzigingen aan te maken.

document.getElementById('trimBtn').addEventListener('click', trimAudio);

async function trimAudio() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const originalElement = document.getElementById('originalAudio');
  const startTime = parseFloat(document.getElementById('start').value);
  const endTime = parseFloat(document.getElementById('end').value);
  const container = document.getElementById('resultContainer');

    // 1. Audio ophalen
    const response = await fetch(originalElement.src);
    const arrayBuffer = await response.arrayBuffer();
    
    // 2. Decoderen
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // 3. Punten berekenen
    const startOffset = Math.max(0, startTime * audioBuffer.sampleRate);
    const endOffset = Math.min(audioBuffer.length, endTime * audioBuffer.sampleRate);
    const frameCount = endOffset - startOffset;

    if (frameCount <= 0) {
      alert("Eindtijd moet groter zijn dan starttijd!");
      return;
    }

    // 4. Nieuwe buffer maken
    const trimmedBuffer = audioCtx.createBuffer(
      audioBuffer.numberOfChannels,
      frameCount,
      audioBuffer.sampleRate
    );

    // 5. Data kopiëren
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const channelData = audioBuffer.getChannelData(i);
      const trimmedData = trimmedBuffer.getChannelData(i);
      
      // We gebruiken de subtype methode voor snelheid
      const segment = channelData.slice(startOffset, endOffset);
      trimmedData.set(segment);
    }

    // 6. Omzetten naar WAV Blob
    const wavBlob = bufferToWave(trimmedBuffer, frameCount);
    const url = URL.createObjectURL(wavBlob);

    // 7. Tonen in UI
    container.innerHTML = '<p>Geknipt fragment:</p>';
    const newAudio = document.createElement('audio');
    newAudio.controls = true;
    newAudio.src = url;
    container.appendChild(newAudio);
}