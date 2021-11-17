var db = require('./database.js')


var sql = `UPDATE user SET failed_logins=0 WHERE id=1`

db.run(sql, [], (err, row) => {
	if(err){
		console.log(err.message)
	}
})