const UrlController = require('../../controllers/UrlsController.js');
const UserController = require('../../controllers/UserController.js');

module.exports = [
    { 
    	method: 'GET', 
    	path: '/', 
    	config: UrlController.urlFindAllConfig
    },
    {
        method: 'GET',
        path: '/total',
        config: UrlController.urlGetTotalConfig
    },
    { 
    	method: 'GET', 
    	path: '/{hash}', 
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
        path: '/{hash}', 
        config: UrlController.urlDeleteConfig
    },
    {
        method: 'GET',
        path: '/redirect/{hash}',
        config: UrlController.urlFindToRedirectConfig
    },
    {
        method: 'POST',
        patch: '/user/create',
        config: UserController.createUser
    }
];