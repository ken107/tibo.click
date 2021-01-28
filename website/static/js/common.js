
const queryString = parseQueryString();

function parseQueryString() {
    const query = {};
    if (location.search) {
        const tuples = location.search.substr(1).split('&');
        for (let i=0; i<tuples.length; i++) {
                const pair = tuples[i].split('=', 2);
                if (pair.length == 2) query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, '%20'));
                else if (pair.length == 1) query[decodeURIComponent(pair[0])] = true;
        }
    }
    return query;
}


const serviceUrl = "https://support.lsdsoftware.com/vemo";

function callService(method, args) {
    return new Promise(function(fulfill, reject) {
        $.ajax({
            method: "POST",
            url: serviceUrl,
            contentType: "application/json",
            data: JSON.stringify({method: method, args: args}),
            dataType: "json",
            success: fulfill,
            error: function(xhr, textStatus, errorThrown) {
                console.log(textStatus, errorThrown, xhr.responseText);
                reject(new Error(getI18n("serviceUnavailableError")));
            }
        })
    })
}


const i18nMessages = {
    "en": {
        joinSessionText: "Join a session",
        joinButton: "Join",
        inviteCodePlaceholder: "Enter Invite Code",
        startSessionText: "Start a new support session",
        startButton: "Start",
        couldNotCopyText: "Please right click on the textbox and choose 'Copy'",
        inviteButton: "Invite",
        talkButton: "Talk",
        requestScreenButton: "Request screen",
        hideChatButton: "Hide chat",
        showChatButton: "Show chat",
        sendButton: "Send",
        inviteDialogTitle: "Invite",
        shareLinkHeading: "Share a link",
        shareCodeHeading: "Share a code",
        copiedText: "copied",
        codeExpirationText: "This code is valid for 5 minutes.",
        onlineStatus: "online",
        offlineStatus: "offline",
        micActiveStatus: "microphone active",
        micInactiveStatus: "microphone off",
        screenSharedStatus: "screen shared",
        screenNotSharedStatus: "screen not shared",
        clickToContinueText: "Click to Continue",
        confirmDialogTitle: "Confirm",
        confirmDialogOkButton: "Accept",
        confirmDialogCancelButton: "Deny",
        requestAudioConfirmation: "John would like to start a voice conversation, do you accept?  (this will turn on your microphone)",
        requestScreenConfirmation: "John would like to see your computer screen, do you accept?",
        missingInviteCodeError: "Please enter the invitation code",
        missingHostNameError: "Please enter a name",
        serviceUnavailableError: "Service is temporarily unavailable, please try again later",
        invalidInviteCodeError: "The invitation code you entered is no longer valid",
        sessionNotFoundError: "This support session has ended",
        selfPronoun: "You",
        customerPronoun: "Customer",
        hostNamePlaceholder: "Your name",
    },
    "vi": {
        joinSessionText: "Gia nhập phiên hỗ trợ",
        joinButton: "Nhập",
        inviteCodePlaceholder: "Mã mời",
        startSessionText: "Bắt đầu một phiên hỗ trợ mới",
        startButton: "Bắt đầu",
        couldNotCopyText: "Hãy nhấp chuột phải trên hộp văn bản và chọn 'Sao chép'",
        inviteButton: "Mời tham gia",
        talkButton: "Nói chuyện",
        requestScreenButton: "Xem màn hình",
        hideChatButton: "Tắt chat",
        showChatButton: "Mở chat",
        sendButton: "Gửi",
        inviteDialogTitle: "Mời tham gia",
        shareLinkHeading: "Gửi liên kết",
        shareCodeHeading: "Gửi mã mời",
        copiedText: "đã sao chép",
        codeExpirationText: "Mã mời sẽ có hiệu lực trong vòng 5 phút.",
        onlineStatus: "có mặt",
        offlineStatus: "vắng mặt",
        micActiveStatus: "micro đang mở",
        micInactiveStatus: "micro đã tắt",
        screenSharedStatus: "đang cho xem màn hình",
        screenNotSharedStatus: "không cho xem màn hình",
        clickToContinueText: "Bấm để kích hoạt",
        confirmDialogTitle: "Xác nhận",
        confirmDialogOkButton: "Đồng ý",
        confirmDialogCancelButton: "Không",
        requestAudioConfirmation: "John muốn nói chuyện qua micro với bạn. Bạn có đồng ý không?",
        requestScreenConfirmation: "John muốn xem màn hình của bạn. Bạn có đồng ý không?",
        missingInviteCodeError: "Xin điền mã mời",
        missingHostNameError: "Xin điền tên",
        serviceUnavailableError: "Dịch vụ đang bị lỗi, xin thử lại sau",
        invalidInviteCodeError: "Mã mời không còn hiệu lực",
        sessionNotFoundError: "Phiên hỗ trợ này đã kết thúc",
        selfPronoun: "Tôi",
        customerPronoun: "Khách Hàng",
        hostNamePlaceholder: "Tên của bạn"
    }
}

function getI18n(name) {
    const lang = queryString.l || "en";
    let index = lang.length;
    do {
        const tmp = lang.slice(0, index);
        if (i18nMessages[tmp] && i18nMessages[tmp][name]) return i18nMessages[tmp][name];
        index = lang.lastIndexOf("-", index-1);
    }
    while (index > 0);
    return i18nMessages["en"][name] || name;
}


if (!Promise.prototype.finally) {
    Object.defineProperty(Promise.prototype, 'finally', {
        value: function(callback) {
            const promise = this;
            function chain() {
                return Promise.resolve(callback()).then(function() {return promise});
            }
            return promise.then(chain, chain);
        },
        configurable: true,
        writable: true
    })
}
