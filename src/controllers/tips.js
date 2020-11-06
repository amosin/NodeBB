'use strict';


const db = require('../database');

const tipsController = module.exports;

tipsController.save = async function (req, res) {
	const { from, to, to_uid, from_uid, value, thash, coin } = req.body;
	const tip_id = await db.incrObjectField('user:' + to_uid + ':tips', 'nextTipId');

	await db.setObject('user:' + to_uid + ':tips:' + tip_id, {
		from,
		from_uid,
		to,
		value,
		coin,
		thash,
	});
	res.json('success');
};
