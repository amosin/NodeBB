'use strict';

var express = require('express');

var uploadsController = require('../controllers/uploads');
var tipsController = require('../controllers/tips');

module.exports = function (app, middleware, controllers) {
	var router = express.Router();
	app.use('/api', router);

	router.get('/config', function (req, res, next) {
		if (req.uid >= 0) {
			middleware.applyCSRF(req, res, next);
		} else {
			setImmediate(next);
		}
	}, controllers.api.getConfig);

	// Ethereum tipping database save
	// var accountMiddlewares = [middleware.exposeUid, middleware.canViewUsers, middleware.checkAccountPermissions];
	router.post('/tips/save', middleware.applyCSRF, tipsController.save);
	// router.get('/user/:userslug/tips', middleware, accountMiddlewares, tipsController.get);

	router.get('/me', controllers.user.getCurrentUser);
	router.get('/user/uid/:uid', middleware.canViewUsers, controllers.user.getUserByUID);
	router.get('/user/username/:username', middleware.canViewUsers, controllers.user.getUserByUsername);
	router.get('/user/email/:email', middleware.canViewUsers, controllers.user.getUserByEmail);

	router.get('/user/uid/:userslug/export/posts', middleware.checkAccountPermissions, middleware.exposeUid, controllers.user.exportPosts);
	router.get('/user/uid/:userslug/export/uploads', middleware.checkAccountPermissions, middleware.exposeUid, controllers.user.exportUploads);
	router.get('/user/uid/:userslug/export/profile', middleware.checkAccountPermissions, middleware.exposeUid, controllers.user.exportProfile);

	router.get('/:type/pid/:id', middleware.authenticateOrGuest, controllers.api.getObject);
	router.get('/:type/tid/:id', middleware.authenticateOrGuest, controllers.api.getObject);
	router.get('/:type/cid/:id', middleware.authenticateOrGuest, controllers.api.getObject);

	router.get('/categories/:cid/moderators', controllers.api.getModerators);
	router.get('/recent/posts/:term?', controllers.posts.getRecentPosts);
	router.get('/unread/total', middleware.authenticate, controllers.unread.unreadTotal);
	router.get('/topic/teaser/:topic_id', controllers.topics.teaser);
	router.get('/topic/pagination/:topic_id', controllers.topics.pagination);

	var multipart = require('connect-multiparty');
	var multipartMiddleware = multipart();
	var middlewares = [middleware.maintenanceMode, multipartMiddleware, middleware.validateFiles, middleware.applyCSRF];
	router.post('/post/upload', middlewares, uploadsController.uploadPost);
	router.post('/topic/thumb/upload', middlewares, uploadsController.uploadThumb);
};
