const UrlController = require('../../controllers/UrlsController.js');

module.exports = [
    { 
    	method: 'GET', 
    	path: '/', 
    	config: UrlController.urlFindAllConfig
    },
    { 
    	method: 'GET', 
    	path: '/{url}', 
    	config: UrlController.urlFindConfig
    },
    { 
    	method: 'POST', 
    	path: '/',
        config: UrlController.urlCreateConfig
    },
    { 
        method: 'PUT', 
        path: '/{hash}',
        config: UrlController.urlUpdateConfig
    },
    { 
        method: 'DELETE', 
        path: '/{url}', 
        config: UrlController.urlDeleteConfig
    }
];