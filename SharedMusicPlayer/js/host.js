//import { createDoc, listenToChangesInDoc, writeToDoc } from "./firebase_helper.js";
import {connectToGuest, applyGuestAnswer, sendMessage} from "./webrtc_communication.js";

await navigator.mediaDevices.getUserMedia({audio: true});

window.connectToGuest = connectToGuest;
window.applyGuestAnswer = applyGuestAnswer;
window.sendMessage = sendMessage;


const songInput = document.querySelector("input");
const docIdInput = document.querySelector("#docId");
const createDocButton = document.querySelector("#createDocButton");
const joinDocButton = document.querySelector("#joinDocButton");

const playButton = document.querySelector("#play");
const stopButton = document.querySelector("#stop");
const pauseButton = document.querySelector("#pause");
const seekSlider = document.querySelector("#seek");
const timer = document.querySelector("#timer");

const startRange = document.querySelector("#startRange");
const endRange = document.querySelector("#endRange");
const applyRange = document.querySelector("#applyRange");
const resetRange = document.querySelector("#resetRange");

let syncDocId = null;

const audio = new Audio();
let sliderInterval = null;

playButton.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
        sendMessage(JSON.stringify({method: "play"}));
        beginSliderAnimation()
    }

});

pauseButton.addEventListener("click", () => {
    audio.pause();
    sendMessage(JSON.stringify({method: "pause"}));
    stopSliderAnimation();
});

stopButton.addEventListener("click", () => {
    audio.pause();
    sendMessage(JSON.stringify({method: "stop"}));
    audio.currentTime = 0;
    stopSliderAnimation();
    seekSlider.value = 0;
});

seekSlider.addEventListener("input", () => {
    audio.currentTime = audio.duration * (seekSlider.value / 100);
});



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

let preferredStartTime;
let preferredEndTime;
let intervalToLoopAtPreferredEndTime;

applyRange.addEventListener("click", () => {
    preferredStartTime = convertMinutesAndSecondsToSeconds(startRange.value);
    preferredEndTime = convertMinutesAndSecondsToSeconds(endRange.value);
    audio.currentTime = preferredStartTime;

    intervalToLoopAtPreferredEndTime = setInterval(() => {
        if (audio.currentTime >= preferredEndTime) {
            audio.currentTime = preferredStartTime;
            sendMessage(JSON.stringify({method: "seek", time: startRange.value}));
        }
    }, 100);

})

resetRange.addEventListener("click", () => {
    clearInterval(intervalToLoopAtPreferredEndTime);
    audio.currentTime = 0;
})


createDocButton?.addEventListener("click", () => {
    syncDocId = docIdInput.value;
    createDoc(syncDocId);
    listenToChangesInDoc(syncDocId, handleDocChange);  
})

joinDocButton?.addEventListener("click", () => {
    syncDocId = docIdInput.value;
    listenToChangesInDoc(syncDocId, handleDocChange);
})

function handleDocChange(data){

    if(!data){
        return
    }

    console.log(data, data.currentTime)
}

connectToGuest()