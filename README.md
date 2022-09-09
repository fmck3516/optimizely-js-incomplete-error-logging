# optimizely-js-incomplete-error-handling

Showcases that datafile retrieval HTTP errors are not properly logged.

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

For our applications, it doesn't matter why the retrieval failed. We need observability into all kinds of request errors. 
Whether they occur at the TCP/IP or HTTP layer. 