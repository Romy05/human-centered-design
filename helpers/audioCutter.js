export function respondToAudio(event) {
    const audioElement = event.target.previousElementSibling;
    const startElement = audioElement.parentElement.querySelector('.start-time');
    const endElement = audioElement.parentElement.querySelector('.end-time');
    const instructionText = document.getElementById('instructions');

    startElement.focus();
    instructionText.textContent = "U kunt nu een fragment selecteren. Selecteer de start van het fragment waar u op wilt reageren en druk op Enter";
    startElement.addEventListener('keydown', (e) => {
        console.log(e.keyCode);
        if (e.keyCode === 13) {
            endElement.focus();
            instructionText.textContent = "Selecteer het einde van het fragment, druk vervolgens op Enter";
        }
    } );

    console.log(audioElement.currentTime);

    // audioElement.play();
    // audioElement.loop = true;
}

// function