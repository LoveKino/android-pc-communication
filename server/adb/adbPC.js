'use strict';

let {
    pc
} = require('general-bridge');
let path = require('path');
let idgener = require('idgener');
let promisify = require('promisify-node');
let fs = promisify('fs');
let spawnp = require('spawnp');
let del = require('del');
let pushFile = require('./pushFile');

let log = console.log; //eslint-disable-line

const tmpDir = path.join(__dirname, 'tmp');

module.exports = (accept) => {
    let handlers = {};
    let accepts = {};

    let connect = (channel, commandDir, sandbox) => {
        accepts[commandDir] = accept(commandDir);
        let sendByChannel = (msg) => send(channel, msg);

        return accepts[commandDir].start((outStr) => {
            let {
                channel, data
            } = JSON.parse(outStr);
            let handler = handlers[channel];
            if (handler) {
                handler(data);
            }
        }).then(() => {
            return pc((handler, send) => {
                handlers[channel] = (data) => {
                    return handler(data, send);
                };
            }, sendByChannel, sandbox);
        });
    };

    let disConnect = (channel, commandDir) => {
        delete handlers[channel];
        if (accepts[commandDir]) {
            accepts[commandDir].stop();
            delete accepts[commandDir];
        }
    };

    return {
        connect,
        disConnect
    };
};

let send = (channel, data) => {
    let dir = path.join(tmpDir, `${idgener()}`);
    let commandPath = path.join(dir, 'command-backup.json');

    return spawnp.pass(`adb shell [ -d ${channel} ]`).then((ret) => {
        if (ret) {
            return fs.mkdir(dir).then(() => {
                return fs.writeFile(commandPath, JSON.stringify(data), 'utf-8').then(() => {
                    return pushFile(commandPath, channel).then(() => {
                        // rename
                        return spawnp([
                            `adb shell mv ${path.join(channel, path.basename(commandPath))} ${path.join(channel, 'command.json')}`
                        ]);
                    });
                });
            }).then(() => {
                return del([dir], {
                    force: true
                });
            }).catch(err => {
                log(err);
                return del([dir], {
                    force: true
                });
            });
        }
    });
};
