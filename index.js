import { initAudioRecorder, handleShortCut } from "./helpers/audioRecorder.js";

let recorder;

if (navigator.mediaDevices) {
    const constraints = { audio: true };

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            recorder = new MediaRecorder(stream);
            initAudioRecorder(recorder);
        });
}

const audioContainers = document.querySelectorAll('.audio-container');

audioContainers.forEach(container => {
    const audioElement = container.querySelector('audio');
    const visualElement = container.querySelector('.audio-visual');

    visualElement.setAttribute('style', `--animation-duration: ${audioElement.duration}s`);
});

const transcriptButtons = document.querySelectorAll('.transcribe');

transcriptButtons.forEach(button => button.addEventListener('click', pressTranscribeButton));

const playAudioButtons = document.querySelectorAll('.play-button');

let activeShortcutListener = null;

playAudioButtons.forEach(button => button.addEventListener('click', pressPlayButton));

export function pressTranscribeButton(e) {
    const transcription = e.target.nextElementSibling;
    transcription.classList.toggle('empty');

    if (transcription.classList.contains('empty')){
        transcription.setAttribute('data-text-content', transcription.textContent);
        transcription.textContent = '';
    } else {
        transcription.textContent = transcription.getAttribute('data-text-content');
    }
}

export function pressPlayButton(e) {
    const button = e.currentTarget;
    const audio = button.nextElementSibling;

    audio.addEventListener('pause', () => {
      if (activeShortcutListener && recorder.state === 'inactive') {
          document.removeEventListener('keydown', activeShortcutListener);
          activeShortcutListener = null;
        }
        button.setAttribute('aria-label', 'Speel spraakbericht af');
        button.querySelector('.icon').classList.remove('playing');
        button.querySelector('.audio-visual').classList.remove('playing');
        
    });

    audio.addEventListener('play', () => {
        if (recorder.state === 'active') {
            recorder.stop();
            console.log('recorder stopped');
        }
        button.setAttribute('aria-label', 'Pauzeer spraakbericht');
        button.querySelector('.icon').classList.add('playing');
        button.querySelector('.audio-visual').classList.add('playing');
    });

    if (audio.paused) {
        audio.play();

        // Verwijder vorige listener als die er nog is
        if (activeShortcutListener) {
            document.removeEventListener('keydown', activeShortcutListener);
        }

        // Sla de nieuwe listener op en voeg hem toe
        activeShortcutListener = (event) => handleShortCut(event, recorder, audio);
        document.addEventListener('keydown', activeShortcutListener);
    } else {
        audio.pause();
    }
}

// Het volgende stuk heb ik laten genereren door AI. Ik ben van plan om hier nog wijzigingen aan te maken.

// document.getElementById('trimBtn').addEventListener('click', trimAudio);

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