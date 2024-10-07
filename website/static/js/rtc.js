
function makeRtc(token, isViewer) {
    const rpcHandlers = {
        onChatMessage(text) {
            rtc.chatLog.push({text})
        },
    }

    const rtc = {
        connected: false,
        error: null,
        buddy: null,
        audioPublished: null,
        videoPublished: null,
        chatLog: [],
        setRpcHandler(method, handler) {
            rpcHandlers[method] = handler
        },
        publishAudio,
        publishScreen,
    }

    if (isViewer) makeViewer()
    else makeControl()

    return rtc



    async function makeViewer() {
        try {
            const peer = new Peer({debug: 2})
            window.addEventListener("pagehide", () => peer.destroy())
            await new Promise((f,r) => peer.once("open", f).once("error", r))
            rtc.connected = true
            const conn = peer.connect(token, {reliable: true})
            rtc.buddy = makeBuddy(conn)
        }
        catch (err) {
            console.error(err)
            rtc.error = err
        }
    }

    async function makeControl() {
        try {
            const peer = new Peer(token, {debug: 2})
            window.addEventListener("pagehide", () => peer.destroy())
            await new Promise((f,r) => peer.once("open", f).once("error", r))
            rtc.connected = true
            rxjs.fromEvent(peer, "connection").pipe(
                rxjs.switchMap(conn => {
                    rtc.buddy = makeBuddy(conn)
                    return rxjs.NEVER.pipe(
                        rxjs.finalize(() => conn.close())
                    )
                })
            ).subscribe()
        }
        catch (err) {
            console.error(err)
            rtc.error = err
        }
    }

    function makeBuddy(conn) {
        const buddy = {
            connected: false,
            sendRpcMessage(method, args) {
                conn.send({method, args})
            },
            sendChat(text) {
                if (!text) return;
                rtc.chatLog.push({text, isOwn: true})
                conn.send({method: "onChatMessage", args: [text]})
            },
        }
        conn.once("open", () => buddy.connected = true)
        conn.on("error", err => {
            console.error(err)
            rtc.error = err
        })
        conn.on("data", ({method, args}) => {
            if (rpcHandlers[method]) rpcHandlers[method].apply(rpcHandlers, args)
            else console.error(`Missing RPC handler for method '${method}'`)
        })
        conn.once("close", () => buddy.connected = false)
        return buddy
    }

    function publishAudio() {
        if (!audioPublished) {
            audioPublished = true;
            return Twilio.Video.createLocalAudioTrack()
                .then(track => room.localParticipant.publishTrack(track))
                .catch(err => {
                    audioPublished = false;
                    throw err;
                })
        }
        else {
            return Promise.resolve();
        }
    }

    function publishScreen() {
        if (!screenPublished) {
            screenPublished = true;
            return Promise.resolve()
                .then(() => {
                    if (!navigator.mediaDevices.getDisplayMedia) throw new Error("Browser doesn't support the Screen Capture API");
                    return navigator.mediaDevices.getDisplayMedia();
                })
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
                    screenPublished = false;
                    throw err;
                })
        }
        else {
            return Promise.resolve();
        }
    }
}
