const optimizelySDK = require('@optimizely/optimizely-sdk');

jest.setTimeout(10000)

var mockserver = require('mockserver-node');
var mockServerClient = require('mockserver-client').mockServerClient;

describe('failed initial fetch', () => {

    it('connection refused', async () => {

        optimizelySDK.setLogLevel(optimizelySDK.enums.LOG_LEVEL.WARN);
        optimizelySDK.setLogger({
            log: (level, message) => console.log(`${level} - ${message}`)
        });

        const sdk = optimizelySDK.createInstance({
            sdkKey: 'MY-DATAFILE-ID',
            datafileOptions: {
                autoUpdate: false,
                urlTemplate: 'http://localhost:1080/datafiles/%s.json',
            }
        });
        const result = await sdk.onReady();
        expect(result.success).toEqual(false);
    });

});