FROM node:7.5-alpine

RUN apk --no-cache add supervisor

COPY supervisor.conf /etc/supervisord-default.conf

ENTRYPOINT ["/usr/bin/supervisord", "--nodaemon", "--configuration", "/etc/supervisord-default.conf"]