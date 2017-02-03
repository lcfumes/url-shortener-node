'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        myConsoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        }, {
            module: 'good-console'
        }, 'stdout'],
        myFileReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ ops: '*' }]
        }, {
            module: 'good-squeeze',
            name: 'SafeJson'
        }, {
            module: 'good-file',
            args: ['./test/fixtures/awesome_log']
        }],
        myHTTPReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ error: '*' }]
        }, {
            module: 'good-http',
            args: ['http://prod.logs:3000', {
                wreck: {
                    headers: { 'x-api-key': 12345 }
                }
            }]
        }]
    }
};


server.register({
    register: require('good'),
    options: options
}, err => {
    if (err) {
        console.log(err);
    } else {
        server.route({
            method: 'GET',
            path: '/',
            handler: (request, reply) => {
                reply('Hello Hapi!');
            }
        })

        server.route({
            method: 'GET',
            path: '/{name}',
            handler: (request, reply) => {
                reply(`Hello ${request.params.name}`);
            }
        })

        server.start(() => {
            console.log(`Server running at: ${server.info.uri}`);
        })
    }
})