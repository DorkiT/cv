var sqlite3 = require('sqlite3').verbose()

var DBSOURCE = "./db/db.sqlite"

var db = new sqlite3.Database(DBSOURCE, (err) => {
	if(err){
		console.error(err.message)
		throw err
	} else {
		console.log('Connected to the SQLite database.')
		db.run(`CREATE TABLE posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title text,
			author text,
			body text
		)
		
		`, (err) => {
			if(err){
				console.log("Table posts id already created: "+ err.message)
			} else {
				console.log("Table posts is created")
			}
		});
		db.run(`CREATE TABLE comments (
			id INTEGER,
			id_comment INTEGER PRIMARY KEY AUTOINCREMENT,
			author_cmt text,
			comment text,
			FOREIGN KEY (id) REFERENCES posts(id)
		)
		`, (err) => {
			if(err){
				console.log("Table COMMENT id already created: "+ err.message)
			} else {
				console.log("Table COMMENT is created")
			}
		});
		db.run(`CREATE TABLE user (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name text, 
	email UNIQUE,
	password text,
	failed_logins INTEGER DEFAULT 0, 
	CONSTRAINT email_unique UNIQUE (email))`, (err) => {
		if(err){
			console.log('Table users is already created.' + err.message)
		} else {
			console.log('Table users is created')
		}
	});
	}
})

module.exports = db


