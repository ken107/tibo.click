
function makeRtc(token, isViewer) {
    const myAudio$ = rxjs.defer(() => {
        rtc.audioPublished = true
        const promise = navigator.mediaDevices.getUserMedia({audio: true})
        return rxjs.from(promise).pipe(
            rxjs.concatWith(rxjs.NEVER),
            rxjs.finalize(() => {
                promise.then(stream => stream.getTracks().forEach(t => t.stop()))
                rtc.audioPublished = false
            })
        )
    }).pipe(
        rxjs.shareReplay({bufferSize: 1, refCount: true})
    )

    const myScreen$ = rxjs.defer(() => {
        rtc.screenPublished = true
        const promise = navigator.mediaDevices.getDisplayMedia()
        return rxjs.from(promise).pipe(
            rxjs.concatWith(rxjs.NEVER),
            rxjs.finalize(() => {
                promise.then(stream => stream.getTracks().forEach(t => t.stop()))
                rtc.screenPublished = false
            })
        )
    }).pipe(
        rxjs.shareReplay({bufferSize: 1, refCount: true})
    )

    const rpcHandlers = {
        onChatMessage(text) {
            rtc.chatLog.push({text})
        },
    }

    const rtc = {
        connected: false,
        error: null,
        buddy: null,
        audioPublished: false,
        screenPublished: false,
        chatLog: [],
        setRpcHandler(method, handler) {
            rpcHandlers[method] = handler
        },
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
            rtc.buddy = makeBuddy(peer, conn)
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
                    rtc.buddy = makeBuddy(peer, conn)
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

    function makeBuddy(peer, conn) {
        const cleanups = []
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
            async publishAudio() {
                let myAudioSub
                try {
                    const myAudioStream = await new Promise((f,r) => myAudioSub = myAudio$.subscribe({next: f, error: r}))
                    const call = peer.call(conn.peer, myAudioStream)
                    cleanups.push(() => call.close())
                    await new Promise((f,r) => call.once("close", f).once("error", r))
                }
                catch (err) {
                    console.error(err)
                    rtc.error = err
                }
                finally {
                    myAudioSub.unsubscribe()
                }
            },
            async publishScreen() {
                let myScreenSub
                try {
                    const myScreenStream = await new Promise((f,r) => myScreenSub = myScreen$.subscribe({next: f, error: r}))
                    const call = peer.call(conn.peer, myScreenStream)
                    cleanups.push(() => call.close())
                    await new Promise((f,r) => call.once("close", f).once("error", r))
                }
                catch (err) {
                    console.error(err)
                    rtc.error = err
                }
                finally {
                    myScreenSub.unsubscribe()
                }
            }
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
        peer.on("call", call => {
            call.answer()
            cleanups.push(() => call.close())
            let isVideo = null
            call.on("stream", stream => {
                isVideo = stream.getVideoTracks().length > 0
                if (isVideo) buddy.videoStream = stream
                else buddy.audioStream = stream
            })
            call.on("error", err => {
                console.error(err)
                rtc.error = err
            })
            call.once("close", () => {
                if (isVideo != null) {
                    if (isVideo) buddy.videoStream = null
                    else buddy.audioStream = null
                }
            })
        })
        conn.once("close", () => {
            buddy.connected = false
            cleanups.forEach(f => f())
        })
        conn.peerConnection.addEventListener("connectionstatechange", () => {
            //https://bugs.chromium.org/p/chromium/issues/detail?id=982793#c15
            if (conn.peerConnection.connectionState == "failed") conn.close()
        })
        return buddy
    }
}
