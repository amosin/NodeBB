'use strict';

const user = require('../../user');
const helpers = require('../helpers');
const accountHelpers = require('./helpers');
const pagination = require('../../pagination');

const tipController = module.exports;

tipController.getTiping = async function (req, res, next) {
	await getTip('account/tiping', 'tiping', req, res, next);
};

tipController.getTipers = async function (req, res, next) {
	await getTip('account/tipers', 'tipers', req, res, next);
};

async function getTip(tpl, name, req, res, next) {
	const userData = await accountHelpers.getUserDataByUserSlug(req.params.userslug, req.uid);
	if (!userData) {
		return next();
	}

	const page = parseInt(req.query.page, 10) || 1;
	const resultsPerPage = 50;
	const start = Math.max(0, page - 1) * resultsPerPage;
	const stop = start + resultsPerPage - 1;

	userData.title = '[[pages:' + tpl + ', ' + userData.username + ']]';

	const method = name === 'tiping' ? 'getTiping' : 'getTipers';
	userData.users = await user[method](userData.uid, start, stop);

	const count = name === 'tiping' ? userData.tipingCount : userData.tiperCount;
	const pageCount = Math.ceil(count / resultsPerPage);
	userData.pagination = pagination.create(page, pageCount);

	userData.breadcrumbs = helpers.buildBreadcrumbs([{ text: userData.username, url: '/user/' + userData.userslug }, { text: '[[user:' + name + ']]' }]);

	res.render(tpl, userData);
}
