import { bufferToWave } from "./wavEncoder.js";

let timeout = null;

export function respondToAudio(event) {
    const audioElement = event.target.previousElementSibling;
    const startElement = audioElement.parentElement.parentElement.querySelector('.start-time');
    const endElement = audioElement.parentElement.parentElement.querySelector('.end-time');
    const instructionText = document.getElementById('instructions');

    startElement.focus();
    instructionText.textContent = "Selecteer de starttijd van het fragment waar u op wilt reageren, door te navigeren door de slider.";
    endElement.addEventListener('focus', () => {
        instructionText.textContent = "Selecteer de eindttijd van het fragment, door te navigeren door de slider.";
    });
    startElement.addEventListener('keydown', (e) => {
        console.log(e.keyCode);
        if (e.keyCode === 13) {
            endElement.focus();
        }
    } );

    console.log(audioElement.currentTime);

    // audioElement.play();
    // audioElement.loop = true;
}

export function createCutter(audioElement) {
    const cutterContainer = document.createElement("div");
    cutterContainer.classList.add('cutter');

    const startLabel = document.createElement("label");
    startLabel.innerText = 'Start van het fragment';

    const startInput = document.createElement("input");
    startInput.classList.add('start-time');
    startInput.setAttribute('type', 'range');
    startInput.setAttribute('aria-describedby', 'instructions');
    startInput.setAttribute('max', `${audioElement.duration}`);
    startInput.setAttribute('value', '0');
    startInput.setAttribute('step', '0.1');

    startLabel.appendChild(startInput);

    const endLabel = document.createElement("label");
    endLabel.innerText = 'Eind van het fragment';

    const endInput = document.createElement("input");
    endInput.classList.add('end-time');
    endInput.setAttribute('type', 'range');
    endInput.setAttribute('aria-describedby', 'instructions');
    endInput.setAttribute('max', `${audioElement.duration}`);
    endInput.setAttribute('value', `${audioElement.duration}`);
    endInput.setAttribute('step', '0.1');

    endLabel.appendChild(endInput);

    

    const confirmButton = document.createElement("button");
    confirmButton.innerText = 'Gebruik dit fragment';

    const backButton = document.createElement("button");
    backButton.innerText = 'Annuleren';

    const buttonList = document.createElement("div");
    buttonList.setAttribute('aria-label', 'Acties voor audiofragment');
    buttonList.setAttribute('role', 'group');

    buttonList.appendChild(confirmButton);
    buttonList.appendChild(backButton);

    cutterContainer.appendChild(startLabel);
    cutterContainer.appendChild(endLabel);
    cutterContainer.appendChild(buttonList);
    
    audioElement.parentElement.parentElement.appendChild(cutterContainer);

    startLabel.addEventListener('change', () => {
        cutAudio(startInput.value, endInput.value, audioElement);
    });

    endLabel.addEventListener('change', () => {
        cutAudio(startInput.value, endInput.value, audioElement);
    });
}

async function cutAudio(start, end, audio) {
    console.log(start, end);
    const audioCtx = new (window.AudioContext || window.webkitAudioContext);
    const startTime = parseFloat(start);
    const endTime = parseFloat(end);
    const container = document.querySelector('.audio-example');

    console.log(startTime, endTime);

    // 1. Audio ophalen
    const response = await fetch(audio.src);
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

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        newAudio.play();
    }, 500);
} 
