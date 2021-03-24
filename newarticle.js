var thesocket;

module.exports = {
	createNewArticle: function(socket, db, date, text, title) {
		thesocket = socket;
		console.log('in new article function');
		let thedata = [];
		thedata.push(title);
		thedata.push(text);
		thedata.push(Math.random() * 6);
		db.articles.insert({date: date, data: thedata});
	}
};