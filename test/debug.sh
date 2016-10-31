#!/bin/bash

CUR_DIR=$(cd `dirname $0`;pwd);
APP_PKG=com.ddchen.bridge.bridgecontainer;
APP_MAIN_ACTIVITY=com.ddchen.bridge.bridgecontainer.MainActivity;

cd $CUR_DIR;

# update library
./updateLibrary.sh

pushd ./BridgeContainer
./gradlew build
popd

# install app
adb shell am force-stop $APP_PKG
adb shell am start -n $APP_PKG/$APP_MAIN_ACTIVITY
