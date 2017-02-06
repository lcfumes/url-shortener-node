'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

const env = process.env.NODE_ENV;
if (env == undefined) {
    console.log("ENV not declared. Config file cannot be found.");
    process.exit(1);
}
global.config = require('./config/config.' + env + '.json');

global.database = require('mongoose');
database.connect(config.database.connection);

const routes = require('./config/routes/routes.js');

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

        server.route(routes);

        server.start(() => {
            console.log(`Server running at: ${server.info.uri}`);
        })
    }
})