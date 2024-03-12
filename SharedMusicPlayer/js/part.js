import {connectToHost, eventTarget} from "./webrtc_communication.js"

// await navigator.mediaDevices.getUserMedia({audio: true});

window.connectToHost = connectToHost

const songInput = document.querySelector("input");
const seekSlider = document.querySelector("#seek");
const timer = document.querySelector("#timer");

const audio = new Audio(); 



eventTarget.addEventListener('messageArrived', event => {

    console.log("message from host:", event.message)

    let data = JSON.parse(event.message)

    if(data.method == "play"){
        audio.play();
        beginSliderAnimation()
    }
    if(data.method == "pause"){
        audio.pause();
        stopSliderAnimation()
    }
    if(data.method == "stop"){
        audio.pause();
        audio.currentTime = 0;
        stopSliderAnimation()
    }

    if(data.method == "seek"){
        audio.currentTime = convertMinutesAndSecondsToSeconds(data.time);
    }

})

songInput.addEventListener("change", (event) => {
    const song = event.target.files[0];
    console.log(song);
    console.log(song.name);
    console.log(song.size);
    console.log(song.type);

    // create an audio player from the selected file
    audio.src = URL.createObjectURL(song);
    timer.innerHTML = `${audio.currentTime}/${audio.duration}`;

});

function beginSliderAnimation(){
    sliderInterval = setInterval(() => {
        if (!audio.paused) {
            seekSlider.value = (audio.currentTime / audio.duration) * 100;
            timer.innerHTML = `${convertSecondsToMinutesAndSeconds(audio.currentTime)}/${convertSecondsToMinutesAndSeconds(audio.duration)}`;
        }
    }, 100);
}

function stopSliderAnimation(){
    clearInterval(sliderInterval);
}


function convertSecondsToMinutesAndSeconds(seconds){
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds}`;
}

function convertMinutesAndSecondsToSeconds(minutes){
    const [minutesString, secondsString] = minutes.split(":");
    return (parseInt(minutesString) * 60) + parseInt(secondsString);
}