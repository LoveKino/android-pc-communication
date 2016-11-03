'use strict';

let spawnp = require('spawnp');
let path = require('path');
let assert = require('assert');

let adbCon = require('../../server/adb');

let log = console.log; // eslint-disable-line

let pkgName = 'com.ddchen.bridge.bridgecontainer';

let commandDir = `/data/user/0/${pkgName}/files/aosp_hook/output`;

let channel = `/data/user/0/${pkgName}/files/aosp_hook/command`;

let mainActivity = `${pkgName}.MainActivity`;

let testPkgDir = path.join(__dirname, '../BridgeContainer');

let sleep = (duration) => {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
};

let runAppTest = (testPkgDir) => {
    return spawnp('./gradlew cAT', [], {
        cwd: testPkgDir,
        stdio: 'inherit'
    });
};

let launchApp = (testPkgDir, pkgName, mainActivity) => {
    return spawnp([
        `adb uninstall ${pkgName}`,
        'adb install app/build/outputs/apk/app-debug.apk',
        `adb shell am force-stop ${pkgName}`,
        `adb shell am start ${pkgName}/${mainActivity}`
    ], [], {
        cwd: testPkgDir
    }).then(() => {
        return sleep(4000);
    });
};

describe('adb', () => {
    it('run BridgeContainer tests', () => {
        let {
            connect
        } = adbCon();

        return connect(channel, commandDir, {
            add: (a, b) => {
                log(`add ${a} ${b}`);
                return a + b;
            },
            test: (a, b) => {
                log(`test ${a} ${b}`);
                a['new'] = b;
                return a;
            },
            error: () => {
                log('error');
                throw new Error('error test');
            }
        }).then(() => {
            return runAppTest(testPkgDir);
        });
    });

    it('node communicate to app', (done) => {
        let {
            connect
        } = adbCon();

        launchApp(testPkgDir, pkgName, mainActivity).then(() => {
            return connect(channel, commandDir);
        }).then((call) => {
            return call('subtraction', [4, 3]).then(ret => {
                assert.equal(ret, 1);
                done();
            });
        });
    });
});
