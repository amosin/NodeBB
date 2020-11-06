'use strict';


const db = require('../database');
const accountHelpers = require('./accounts/helpers');
const helpers = require('./helpers'); 
const users = require('./user');

const tipsController = module.exports;

tipsController.save = async function (req, res) {
	const { from, to, to_uid, from_uid, from_username, value, thash, coin, tdate } = req.body;
	const tip_id = await db.incrObjectField('user:' + to_uid + ':tips', 'nextTipId');

	await db.setObject('user:' + to_uid + ':tips:' + tip_id, {
		from,
		from_uid,
		from_username,
		to,
		value,
		coin,
		thash,
		tdate,
	});
	res.json('success');
};


tipsController.get = async function (req, res, next) {
    const userData = await accountHelpers.getUserDataByUserSlug(req.params.userslug, req.uid);
    if (!userData) {
        return next();
    }
    const tipsCount = await db.getObjectField('user:' + userData.uid + ':tips', 'nextTipId');
    const tips = [];
    var mytip;
    for (var counter = 0; counter <= tipsCount; counter++) {
        mytip = await db.getObject('user:' + userData.uid + ':tips:'+ counter)
        if (mytip) {
        mytip.date = new Date(mytip.tdate * 1000).toLocaleString();
            if (mytip['from_uid'] !== '0') {
               console.log(mytip['from_uid']);
               const eachuser = await users.getUserDataByUID(req.uid, mytip['from_uid']);
               mytip.from_username = eachuser.username;
            } else {
                mytip.from_username = 'Unknown';

            }
        }
        //console.log(mytip);
        tips.push(mytip);
    }
    userData.tips = tips.reverse()
    userData.title = '[[pages:account/tips]]';
    userData.breadcrumbs = helpers.buildBreadcrumbs([{ text: userData.username, url: '/user/' + userData.userslug }, { text: '[[pages:account/tips]]' }]);
    res.render('account/tips', userData);
};
