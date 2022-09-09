# optimizely-js-incomplete-error-handling

Showcases that datafile retrieval HTTP errors are not properly logged.

How to run:
```
yarn install
yarn test
```

Errors at the network layer (e.g., `ECONNREFUSED`) result in logs with level `ERROR`: 
```
 PASS  test/ECONNREFUSED.test.js
  ● Console

    console.log
      4 - DatafileManager: Error fetching datafile: Request error
```

Errors at application layer (e.g., `HTTP 500 Internal Server Error`) are silently swallowed:
```
 PASS  test/HTTP500.test.js
```

The Java SDK [checks for HTTP status codes](https://github.com/optimizely/java-sdk/blob/8b8a9838cfd3824d13e5c472a7d578a4f4d4ed97/core-httpclient-impl/src/main/java/com/optimizely/ab/config/HttpProjectConfigManager.java#L106) and logs HTTP errors:
```
2022-09-09T09:05:19,399 c.o.a.c.HttpProjectConfigManager: Error fetching datafile
org.apache.http.client.ClientProtocolException: unexpected response when trying to fetch datafile, status: 500
	at com.optimizely.ab.config.HttpProjectConfigManager.getDatafileFromResponse(HttpProjectConfigManager.java:115)
	...
```


For our applications, it doesn't matter why the retrieval failed. We need observability into all kinds of request errors. 
Whether they occur at the TCP/IP or HTTP layer. 

# Possible Root Cause

`@optimizely/js-sdk-datafile-manager/lib.nodeRequest.js:getResponseFromRequest` resolves the Promise without taking the `statusCode` into account: 
```
function getResponseFromRequest(request) {
    ...
    response.on('end', function () {
        ...
        resolve({
            statusCode: incomingMessage.statusCode,
            body: responseData,
            headers: createHeadersFromNodeIncomingMessage(incomingMessage),
        });
    });
}
```

HTTP errors should cause a rejection. Example:
```
function getResponseFromRequest(request) {
    ...
    response.on('end', function () {
       ...
        if (400 <= incomingMessage.statusCode <= 599) {
            reject(new Error(JSON.stringify({
                statusCode: incomingMessage.statusCode,
                body: responseData,
                headers: createHeadersFromNodeIncomingMessage(incomingMessage),
            })));
        } else {
            resolve({
                statusCode: incomingMessage.statusCode,
                body: responseData,
                headers: createHeadersFromNodeIncomingMessage(incomingMessage),
            });
        }
    });
    ...
}
```
This will fix the logging issue:
```
 PASS  test/HTTP500.test.js
  ● Console

    console.log
      4 - DatafileManager: Error fetching datafile: {"statusCode":500,"body":"","headers":{"connection":"close","content-length":"0"}}

      at Object.log (test/HTTP500.test.js:39:46)
```
