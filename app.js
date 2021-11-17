const express = require('express')
const param = require('jquery')
const app = express()
const db = require('./database.js')
const bcrypt = require('bcrypt')
const session = require('express-session')



app.set('view engine', 'ejs')
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))

app.use(express.urlencoded())
app.use(session({
	secret: 'randomly generated secret',
}))
app.use(setCurrentUser)



//get's requestions

app.get('/', function(req, res){
	res.render('index', {activePage: 'home', titleOf: 'Home'})
})

app.get('/register', function(req, res){
	res.render('register', {activePage: 'register', titleOf: 'Register'})
})

app.get('/login', function(req, res){
	res.render('login', {activePage: 'login', error: "", titleOf: 'Login'})
})

app.get('/logout', function(req, res){
	req.session.userId = null
	req.session.loggedIn = false
	res.redirect('/login')
})

app.get('/profile', checkAuth, function(req, res){
	res.render('profile', {activePage: 'profile', titleOf: 'Profile'})
})



//post's requestions 
app.post('/register', function(req, res){
	bcrypt.hash(req.body.password, 10, function(err, hash){
		var data = [
			req.body.name,
			req.body.email,
			hash
		]

		var sql = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
		db.run(sql, data, function(err, result){
			if(err){
				res.status(400)
				res.send('database error: ' + err.message)
				return;
			}
			res.render('register_answer', {activePage: 'register', formData: req.body, titleOf: 'Register'})

		});
	});
})

app.post('/login', function(req, res){
	var sql = 'SELECT * FROM user WHERE email=?'
	var params = [req.body.email]
	var error = ''
	var num
	db.get(sql, params, (err, row) => {
		if(err){
			error = err.message
		} if(row == undefined){
			error = 'Wrong email or password'
		} if(error != ""){
			res.render('login', {activePage: 'login', error: error, titleOf: 'Login'})
			return;
		}
		bcrypt.compare(req.body.password, row['password'], function(err, hashRes){
			sql = 'SELECT failed_logins FROM user WHERE email=?'

				db.get(sql, params,(err, fl) => {
					if(err){
						console.log('database error: ' + err.message)
					}
					num = fl.failed_logins + 1;
					console.log(num)


					if(hashRes === false) {
						
						sql = 'UPDATE user SET failed_logins=? WHERE email=?'
						params = [
							num,
							req.body.email
						]
						console.log(params)
		
						db.run(sql, params, (err, row)=>{
							if(err){
								console.log("database error: " + err.message)
							}
						})
						error = 'Wrong email or password'
						res.render('login', {activePage: 'login', error: error, titleOf: 'Login'})
						return;
					} 
					console.log(num)
					if(num >= 3) {
						error = 'Your account is blocked'
						res.render('login', {activePage: 'login', error: error, titleOf: 'Login'})
						return;
					}
					console.log(row)
					req.session.userId = row['id']
					req.session.loggedIn = true
					res.redirect('/')
			})
		})
	})
})


app.post('/profile', checkAuth,function(req, res){
	console.log(req.body.email)
	bcrypt.hash(req.body.password, 10, function(err, hash){
		var sql = 'UPDATE user SET name=?, email=?, password=? WHERE id=?'
		var params = [
			req.body.name,
			req.body.email,
			hash,
			req.session.userId
		]
		db.run(sql, params, (err, row)=>{
			if(err){
				res.status(400)
				res.send('database error: ' + err.message)
			}
			res.redirect('/profile')
		})
	})
})




app.listen(3000)





//functions which used in this app to uppercase 
function capitalizeFirstLetter(word){
	return word.charAt(0).toUpperCase() + word.slice(1);
}



function setCurrentUser(req, res, next){
	if(req.session.loggedIn){
		var sql = 'SELECT * FROM user WHERE id=?'
		var params = [req.session.userId]
		db.get(sql, params, (err, row)=>{
			if(row !== undefined){
				res.locals.currentUser = row
			}
			return next();
		});
	} else {
		return next();
	}
}


//function for checking that person is logined
function checkAuth(req, res, next){
	if(req.session.loggedIn){
		return next()
	} else {
		res.redirect('/login')
	}
}

