var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();

var myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({limit: myLimit}));

app.all('*', function (req, res, next) {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        var targetURL = 'https://api.thetvdb.com' + req.url;
        if (!targetURL) {
            res.send(500, { error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        headers = {
            Accept: 'application/json'
        }
        body = {};
        if (req.header('Authorization')) {
            headers = {
                ...headers,
                Authorization: req.header('Authorization')
            }
        }
        if (req.method === "POST") {
            body = req.body;
        }
        console.log(targetURL);
        console.log(headers);
        console.log('Body: ' + JSON.stringify(body));

        if (Object.keys(req.body).length === 0) {
            request({ url: targetURL, method: req.method, headers },
                function (error, response, body) {
                    if (error) {
                        console.error('error: ' + response)
                    }
                }).pipe(res);
        } else {
            request({ url: targetURL, method: req.method, json: body, headers },
                function (error, response, body) {
                    if (error) {
                        console.error('error: ' + response)
                    }
                }).pipe(res);
        }
    }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});