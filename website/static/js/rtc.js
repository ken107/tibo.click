
connected = false;
audioPublished = false;
screenPublished = false;
buddy = {
    connected: 0,
    dataSubscribed: 0,
    audioTrack: null,
    videoTrack: null,
};
chatLog = [];


const rtc = (function() {
    let room = null;
    const localDataTrack = new Twilio.Video.LocalDataTrack();

    function connect(token) {
        return Twilio.Video.connect(token, {tracks: [localDataTrack]})
            .then(function(result) {
                if (room) throw new Error("Already connected before");
                room = result;
                connected = true;

                // Connect events
                room.on("disconnect", () => connected = false);
                room.on("reconnected", () => connected = true);

                // Log your Client's LocalParticipant in the Room
                console.log(`Connected to the Room as LocalParticipant "${room.localParticipant.identity}"`);

                // Log any Participants already connected to the Room
                room.participants.forEach(participant => {
                    console.log(`Participant "${participant.identity}" is connected to the Room`);
                    buddy.connected++;
                });

                // Log new Participants as they connect to the Room
                room.on('participantConnected', participant => {
                    console.log(`Participant "${participant.identity}" has connected to the Room`);
                    buddy.connected++;
                });

                // Log Participants as they disconnect from the Room
                room.on('participantDisconnected', participant => {
                    console.log(`Participant "${participant.identity}" has disconnected from the Room`);
                    buddy.connected--;
                });

                // Log when track subscribed
                room.on("trackSubscribed", function(track, publication, participant) {
                    console.log(`Subscribed to ${track.kind} track of participant "${participant.identity}"`);
                    if (track.kind == "data") {
                        buddy.dataSubscribed++;
                        track.on("message", onRpcMessage);
                    }
                    else if (track.kind == "audio") {
                        if (buddy.audioTrack) buddy.audioTrack.detach();
                        buddy.audioTrack = track;
                    }
                    else if (track.kind == "video") {
                        if (buddy.videoTrack) buddy.videoTrack.detach();
                        buddy.videoTrack = track;
                    }
                })

                // Log when track unsubscribed
                room.on("trackUnsubscribed", function(track, publication, participant) {
                    console.log(`Unsubscribed from ${track.kind} track of participant "${participant.identity}"`);
                    if (track.kind == "data") {
                        buddy.dataSubscribed--;
                    }
                    else if (track.kind == "audio") {
                        track.detach();
                        if (buddy.audioTrack == track) buddy.audioTrack = null;
                    }
                    else if (track.kind == "video") {
                        track.detach();
                        if (buddy.videoTrack == track) buddy.videoTrack = null;
                    }
                })
            })
    }

    function sendRpcMessage(method, args) {
        localDataTrack.send(JSON.stringify({method, args}));
    }

    function onRpcMessage(json) {
        const data = JSON.parse(json);
        if (rpcHandlers[data.method]) {
            rpcHandlers[data.method].apply(rpcHandlers, data.args);
        }
        else console.error(`Missing RPC handler for method '${data.method}'`);
    }

    const rpcHandlers = {
        onChatMessage: function(text) {
            chatLog.push({text});
        },
        onRequestAudio: function() {
            publishAudio();
        },
        onRequestScreen: function() {
            if (!screenPublished) {
                screenPublished = true;
                navigator.mediaDevices.getDisplayMedia()
                    .then(stream => stream.getTracks()[0])
                    .then(mediaStreamTrack => {
                        const localVideoTrack = new Twilio.Video.LocalVideoTrack(mediaStreamTrack);
                        return room.localParticipant.publishTrack(localVideoTrack)
                            .then(() => {
                                mediaStreamTrack.addEventListener("ended", () => {
                                    room.localParticipant.unpublishTrack(localVideoTrack);
                                    screenPublished = false;
                                })
                            })
                    })
                    .catch(err => {
                        console.error(err);
                        screenPublished = false;
                    })
            }
        }
    }

    function sendChat(text) {
        chatLog.push({text, isOwn: true});
        sendRpcMessage("onChatMessage", [text]);
    }

    function publishAudio() {
        if (!audioPublished) {
            audioPublished = true;
            Twilio.Video.createLocalAudioTrack()
                .then(track => room.localParticipant.publishTrack(track))
                .catch(err => {
                    console.error(err);
                    audioPublished = false;
                })
        }
    }

    function startAudioConversation() {
        publishAudio();
        sendRpcMessage("onRequestAudio");
    }

    function requestScreen() {
        sendRpcMessage("onRequestScreen");
    }

    return {
        connect,
        sendRpcMessage,
        setRpcHandler: (method, handler) => rpcHandlers[method] = handler,
        sendChat,
        startAudioConversation,
        requestScreen,
    }
})();
