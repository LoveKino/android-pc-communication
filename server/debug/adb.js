'use strict';

let adbCon = require('../adb');

let {
    connect
} = adbCon();

let log = console.log; // eslint-disable-line

let commandDir = '/data/user/0/com.ddchen.bridge.bridgecontainer/files/aosp_hook/output';

let channel = '/data/user/0/com.ddchen.bridge.bridgecontainer/files/aosp_hook/command.json';

connect(channel, commandDir, {
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
}).then((call) => {
    setTimeout(() => {
        call('subtraction', [4, 2]).then(ret => {
            log(ret);
        }).catch(err => {
            log(err);
        });
    }, 4000);
}).catch(err => {
    log(err);
});
