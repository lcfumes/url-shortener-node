const UrlController = require('../../controllers/urls.js');

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
        method: 'DELETE', 
        path: '/{url}', 
        config: UrlController.urlDeleteConfig
    }
];