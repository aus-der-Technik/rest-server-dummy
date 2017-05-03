#!/bin/bash

docker run \
    --name "echo" \
    --restart=always \
    --publish 7040:8080 \
    --hostname echo.ausdertechnik.de \
    --detach echo

