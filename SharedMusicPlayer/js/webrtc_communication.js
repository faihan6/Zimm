const guestPCs = []

let hostPC;
let hostChannel;


function initHost(){

}

async function connectToGuest(){
    let pc = new RTCPeerConnection();
    const guestId = Math.random().toString(36).slice(2)

    let dataChannel = pc.createDataChannel("chat");
    guestPCs.push({
        guestId, pc, dataChannel
    });

    const offer = await pc.createOffer();
    pc.setLocalDescription(offer);

    // send to guest
    pc.onicegatheringstatechange = () => {
        if(pc.iceGatheringState === "complete"){
            console.log({guestId, sdp: pc.localDescription});
        }
    }

    eventTarget.addEventListener('answerArrived', event => {
        console.log("answer arrived", event)
        pc.setRemoteDescription(event.answer)
    })
    
}

async function connectToHost(obj){

    let guestId = obj.guestId;
    let offer = obj.sdp;

    hostPC = new RTCPeerConnection();

    hostPC.addEventListener('datachannel', event => {
        console.log("data channel", event.channel)
        hostChannel = event.channel
        hostChannel.addEventListener('message', event => {

            const msgEvent = new Event('messageArrived');
            msgEvent.message = event.data;
            eventTarget.dispatchEvent(msgEvent)
            
        })

    })

    await hostPC.setRemoteDescription(offer);

    const answer = await hostPC.createAnswer();
    hostPC.setLocalDescription(answer);


    // send to host
    hostPC.onicegatheringstatechange = () => {
        if(hostPC.iceGatheringState === "complete"){
            console.log({guestId, sdp: hostPC.localDescription});
        }
    }


}

let eventTarget = new EventTarget();

function applyGuestAnswer(obj){
    let guestId = obj.guestId;
    let answer = obj.sdp;

    let event = new Event('answerArrived');
    event.guestId = guestId;
    event.answer = answer;
    eventTarget.dispatchEvent(event)
}

function sendMessage(message){
    guestPCs.forEach(guestPC => {
        guestPC.dataChannel.send(message);
    })
    
}

export {connectToGuest, connectToHost, applyGuestAnswer, sendMessage, eventTarget}