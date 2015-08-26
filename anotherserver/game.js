
/* main action */
exports.createPlayer = function(req, res){
	//res.redirect('/home');
	if(!req.session.user)
		res.render('main/maincover', { title: 'StyleCompany DB', id: 'main', brand: brand });
	else
		res.render('dbapp/dbapp', { title: 'DB APP', id: 'dbapp', brand: brand });
}

exports.createAccount = function(req, res){
	res.render('main/createAccount', { title: 'Create New Account', brand: brand });
};

/* db app */
exports.home = function(req, res){
	if(!req.session.user)
		res.redirect('/');
	else
		res.render('dbapp/home', { title: 'Home', id: 'home', brand: brand });
};

exports.about = function(req, res){
	if(!req.session.user)
		res.redirect('/');
	else
		res.render('dbapp/about', { title: 'About', id: 'about', brand: brand });
};

exports.login = function(req, res){
	var logid = req.body.logid;
	var passwd = req.body.passwd;
	console.log('[!] Login Trial', req.ip, logid, passwd);

	if(logid == 'admin' && passwd == 'asdf'){
		console.log('[+] Login Success');
		req.session.user = {
			login : 'admin',
			profile : {name : '관리자'},
			role : 'admin',
		};
		res.redirect('/');
	}
	else{
		console.log('[-] Login Failed');
		res.redirect('/');
	}
};

exports.logout = function(req, res){
	req.session.user = null;
	res.redirect('/');
};

exports.register = function(req, res){
	var newUser = new User({
		logid: (req.body.logid + '').toLowerCase(),
		passwd: req.body.passwd,
		email: req.body.email,
		profile: {'name':req.body.name},
		role: 'staff',
		requestTime: new Date(),
		requestReferer: req.get('referer'),
		requestIP: req.ip
	});
	console.log('[!] Register Trial', newUser);

	newUser.save(function(mongoErr, mongoRes){
		if (mongoErr) {
			if (mongoErr.code == 11000) {
				//이미 사용중인 아이디
			}
			else {
				//알수 없는 에러
			}
			res.redirect('/');
		}
		else {
			user.comparePassword(req.body.passwd, function(err, isMatch){
				if (err) throw err;
				if (isMatch){
					var tempUser = createToken(mongoRes);
					req.session.user = tempUser;
					console.log('[+] Login Success!', req.session.user);
					res.redirect('/');
				}
			});
		}
	});
};


var createToken = function(mongoRes){
	return {
		logid : mongoRes.logid,
		profile : mongoRes.profile,
		role : mongoRes.role,
		email : mongoRes.email,
		_id : mongoRes._id
	};
}
