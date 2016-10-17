// IceServersHandler.js

var iceFrame, loadedIceFrame;

// put your data in these 6-lines
var ident       = 'asimashfaq';
var secret      = '0f7d2c32-9047-11e6-8adf-5559ffc598df';
var domain      = 'stackjunction.com.pk';
var application = 'test';
var room        = 'testroom';
var secure      = 0;


function loadIceFrame(callback, skip) {
    if (loadedIceFrame) return;
    if (!skip) return loadIceFrame(callback, true);

    loadedIceFrame = true;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
        iframe.isLoaded = true;

        listenEventHandler('message', iFrameLoaderCallback);

        function iFrameLoaderCallback(event) {
            if (!event.data || !event.data.iceServers) return;
            callback(event.data.iceServers);
            window.removeEventListener('message', iFrameLoaderCallback);
        }

        iframe.contentWindow.postMessage('get-ice-servers', '*');
    };
    iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
    iframe.style.display = 'none';
    (document.body || document.documentElement).appendChild(iframe);
}

if (typeof window.getExternalIceServers !== 'undefined' && window.getExternalIceServers == true) {
    loadIceFrame(function(externalIceServers) {
        if (!externalIceServers || !externalIceServers.length) return;
        window.RMCExternalIceServers = externalIceServers;

        if (window.iceServersLoadCallback && typeof window.iceServersLoadCallback === 'function') {
            window.iceServersLoadCallback(externalIceServers);
        }
    });
}

function getSTUNObj(stunStr) {
    var urlsParam = 'urls';
    if (isPluginRTC) {
        urlsParam = 'url';
    }

    var obj = {};
    obj[urlsParam] = stunStr;
    return obj;
}

function getTURNObj(turnStr, username, credential) {
    var urlsParam = 'urls';
    if (isPluginRTC) {
        urlsParam = 'url';
    }

    var obj = {
        username: username,
        credential: credential
    };
    obj[urlsParam] = turnStr;
    return obj;
}

function getExtenralIceFormatted() {
    var iceServers = [];
    window.RMCExternalIceServers.forEach(function(ice) {
        if (!ice.urls) {
            ice.urls = ice.url;
        }

        if (ice.urls.search('stun|stuns') !== -1) {
            iceServers.push(getSTUNObj(ice.urls));
        }

        if (ice.urls.search('turn|turns') !== -1) {
            iceServers.push(getTURNObj(ice.urls, ice.username, ice.credential));
        }
    });
    return iceServers;
}

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}


var IceServersHandler = (function() {
    function getIceServers(connection) {
        var iceServers = [];


        var url = 'https://service.xirsys.com/ice';
        var xhr = createCORSRequest('POST', url);
        xhr.onload = function() {
            var ice = JSON.parse(xhr.responseText).d.iceServers;
            connection.iceServers = ice;
            iceServers = ice;
        };
        xhr.onerror = function() {
            console.error('Woops, there was an error making xhr request.');
        };
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.send('ident='+ident+'&secret='+secret+'&domain='+domain+'&application='+application+'&room='+room+'&secure='+secure);




        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
