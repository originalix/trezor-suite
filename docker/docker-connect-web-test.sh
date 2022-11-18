#!/usr/bin/env bash
set -e

xhost +
export TEST_FILE=$1
LOCAL_USER_ID="$(id -u "$USER")"
export LOCAL_USER_ID

docker-compose -f ./docker/docker-compose.connect-web-test.yml up --build --abort-on-container-exit
