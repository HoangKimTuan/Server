var http = require("http");



function param(obj) {
    var str = "";
    for (var key in obj) {
        if (str != "") {
            str += "&";
        }
        str += key + "=" + obj[key];
    }
    return str;
}
function guiRequest(hostname, port, path, method, data, callback) {
    var options = {
        hostname: hostname,
        port: port,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    if (method == "GET") {
        options.path = options.path + "?" + param(data);
    }
    console.log(options.path);

    var req = http.request(options, function(res) {
        str = "";
        res.setEncoding('utf8');
        res.on('data', function (body) {
            str += body;
        });
        res.on("end", function () {
            callback(str);
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    // write data to request body
    if (method == "POST") {
        req.write(JSON.stringify(data));
    }
    req.end();
}

var service = {};

service.guiRequest = guiRequest;


module.exports = service;