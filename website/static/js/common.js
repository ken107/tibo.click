
var queryString = parseQueryString();

function parseQueryString() {
    var query = {};
    if (location.search) {
        var tuples = location.search.substr(1).split('&');
        for (var i=0; i<tuples.length; i++) {
                var pair = tuples[i].split('=', 2);
                if (pair.length == 2) query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, '%20'));
                else if (pair.length == 1) query[decodeURIComponent(pair[0])] = true;
        }
    }
    return query;
}


var serviceUrl = "https://support.lsdsoftware.com/vemo";

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


var i18nMessages = {
    "en": {
        joinSessionText: "Join a session",
        joinButton: "Join",
        inviteCodePlaceholder: "Enter Invite Code",
        startSessionText: "Start a new support session",
        startButton: "Start",
    }
}

function getI18n(name) {
    var lang = queryString.l || "en";
    var index = lang.length;
    do {
        var tmp = lang.slice(0, index);
        if (i18nMessages[tmp] && i18nMessages[tmp][name]) return i18nMessages[tmp][name];
        index = lang.lastIndexOf("-", index-1);
    }
    while (index > 0);
    return i18nMessages["en"][name] || name;
}


if (!Promise.prototype.finally) {
    Object.defineProperty(Promise.prototype, 'finally', {
        value: function(callback) {
            var promise = this;
            function chain() {
                return Promise.resolve(callback()).then(function() {return promise});
            }
            return promise.then(chain, chain);
        },
        configurable: true,
        writable: true
    })
}
