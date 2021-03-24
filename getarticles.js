var thesocket;

module.exports = {
	getArticles: function(socket, db) {
		thesocket = socket;
		console.log('in get article function');
		//console.log(db.articles.find().sort({$natural: -1}).limit(50));
		db.articles.distinct("data", {date: "11/11/2019"}, function(err, res) {
			console.log(res);
			socket.emit('article', {
				date: "11/11/2019", 
				info: res
			});
		});
	}
};