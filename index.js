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

// Het volgende stuk heb ik laten genereren door AI. Ik ben van plan om hier nog wijzigingen aan te maken.

document.getElementById('trimBtn').addEventListener('click', trimAudio);

async function trimAudio() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const originalElement = document.getElementById('originalAudio');
  const startTime = parseFloat(document.getElementById('start').value);
  const endTime = parseFloat(document.getElementById('end').value);
  const container = document.getElementById('resultContainer');

  container.innerHTML = 'Bezig met verwerken...';

  try {
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
    
    // Optioneel: Download link
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = "geknipte_audio.wav";
    dl.innerText = "Download fragment";
    dl.style.display = "block";
    container.appendChild(dl);

  } catch (e) {
    container.innerHTML = 'Fout: ' + e.message + '. Waarschijnlijk CORS blokkade.';
  }
}

// WAV Encoder helper
function bufferToWave(abuffer, len) {
  let numOfChan = abuffer.numberOfChannels,
      length = len * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [], i, sample, offset = 0, pos = 0;

  const setUint16 = (d) => { view.setUint16(pos, d, true); pos += 2; };
  const setUint32 = (d) => { view.setUint32(pos, d, true); pos += 4; };

  setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
  setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
  setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);

  for(i = 0; i < numOfChan; i++) channels.push(abuffer.getChannelData(i));
  while(pos < length) {
    for(i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
      view.setInt16(pos, sample, true); pos += 2;
    }
    offset++;
  }
  return new Blob([buffer], {type: "audio/wav"});
}