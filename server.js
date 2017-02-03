'use strict';

const Hapi = require('hapi');
const UrlController = require('./controllers/urls.js');

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
            handler: UrlController.getAllUrl
        })

        server.route({
            method: 'GET',
            path: '/{url}',
            handler: UrlController.findUrl
        })

        server.route({
            method: 'POST',
            path: '/create',
            config: UrlController.urlCreateConfig
        })

        server.start(() => {
            console.log(`Server running at: ${server.info.uri}`);
        })
    }
})