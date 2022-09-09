const optimizelySDK = require('@optimizely/optimizely-sdk');

jest.setTimeout(10000)

var mockserver = require('mockserver-node');
var mockServerClient = require('mockserver-client').mockServerClient;

describe('failed initial fetch', () => {

    beforeAll(async () => {
        await mockserver.start_mockserver({
            serverPort: 1080,
            trace: false
        })
    });

    afterAll(async () => {
        mockserver.stop_mockserver({
            serverPort: 1080
        });
    });


    it('HTTP 500 response', async () => {

        await mockServerClient("localhost", 1080).mockWithCallback(
            {
                'path': '/datafiles/MY-DATAFILE-ID.json'
            },
            () => {
                return {
                    'statusCode': 500,
                }
            }
        )

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