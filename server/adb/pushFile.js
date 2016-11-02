'use strict';

let spawnp = require('spawnp');
let path = require('path');

module.exports = (file, targetDir) => {
    return spawnp([`adb push ${file} ${targetDir}`]).then(() => {
        return spawnp.exec([
            `adb shell ls -dZ ${targetDir} | cut -d " " -f1`, // get security context
            `adb shell stat -c "%U" ${targetDir}`, // get user name
            `adb shell stat -c "%G" ${targetDir}` // get group name
        ]);
    }).then(([secCon, userName, groupName]) => {
        let innerFile = path.join(targetDir, path.basename(file));
        return spawnp([
            `adb shell chcon ${secCon.trim()} ${innerFile}`,
            `adb shell chown ${userName.trim()} ${innerFile}`,
            `adb shell chgrp ${groupName.trim()} ${innerFile}`
        ], [], {
            stdio: 'inherit'
        }, {
            stderr: true
        });
    });
};
