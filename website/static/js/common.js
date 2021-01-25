
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


const serviceUrl = "http://localhost:8081/vemo";

function callService(method, args) {
    return new Promise(function(fulfill, reject) {
        $.ajax({
            method: "POST",
            url: serviceUrl,
            contentType: "application/json",
            data: JSON.stringify({method: method, args: args}),
            dataType: "json",
            success: fulfill,
            error: function(xhr) {
                console.log(xhr.response);
                reject(new Error("Service unavailable"));
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
