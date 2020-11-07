'use strict';


const db = require('../database');
const accountHelpers = require('./accounts/helpers');
const helpers = require('./helpers'); 
const users = require('./user');
const notifications = require('../notifications');

const tipsController = module.exports;

tipsController.save = async function (req, res) {
	const { from, to, to_uid, from_uid, from_username, value, thash, coin } = req.body;
	const tip_id = await db.incrObjectField('user:' + to_uid + ':tips', 'nextTipId');
	await db.setObject('user:' + to_uid + ':tips:' + tip_id, {
		from,
		from_uid,
		from_username,
		to,
		value,
		coin,
		thash,
		tdate: new Date(),
	});
    const {username} = await users.getUserDataByUID(to_uid, from_uid);
			notifications.create({
                nid: 'plugin:tips:' + to_uid, // a unique notification id
				bodyShort: '[[tips:received.notification_title, ' + value + ', ' + coin + ', ' +  username +']]',
				path: '/user/' + from_username + '/tips',
				from: from_uid
            }, function(err, notification) {
                if (err) {
                  return callback(err);
                }
                notifications.push(notification, [to_uid]);
			    }).then(res.json('success'));
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
        mytip.date = new Date(mytip.tdate).toLocaleString('pt-BR');
            if (mytip['from_uid'] !== '0') {
               const eachuser = await users.getUserDataByUID(req.uid, mytip['from_uid']);
               mytip.from_username = eachuser.username;
            } else {
                mytip.from_username = 'Unknown';

            }
        }
        if (mytip){
          tips.push(mytip);
        }
    }

    userData.tips = tips.reverse()
    userData.title = '[[pages:account/tips]]';
    userData.breadcrumbs = helpers.buildBreadcrumbs([{ text: userData.username, url: '/user/' + userData.userslug }, { text: '[[pages:account/tips]]' }]);
    res.render('account/tips', userData);
};
