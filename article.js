function newArticle() {
	let text = document.getElementById('thearticle').value;
	let title = document.getElementById('titleentry').value;
	console.log(title);
	socket.emit('newarticle', {
		date: getTodaysDate(), 
		text: text, 
		title: title
	});
}

function getTodaysDate() {
	var today = new Date();
	var dd = String(today.getDate())/*.padStart(2, '0')*/;
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	today = mm + '/' + dd + '/' + yyyy;
	return today;
}

function showArticles(type, data) {
	let info = data.info;
	let likes = 0;
	//let infotypes = ['date', 'title', 'name', 'text'];
	let art = document.createElement('table');
	let md = data.date.substring(0, data.date.lastIndexOf('/'));
	md = md.replace('/', '-');
	var whichrow = document.getElementById(type + md);
	console.log(type + md);
	console.log(whichrow);
	for(var a = 0; a < info.length; a++) {
		if(!isNaN(info[a])) {
			whichrow.appendChild(art);
			art = document.createElement('table');
			likes = info[a];
			console.log('displaying articles with ' + likes + ' likes');
		}
		else {
			let curart = document.createElement('tr');
			let curartcell = document.createElement('th');
			curartcell.innerHTML = info[a];
			curart.appendChild(curartcell);
			art.appendChild(curart);
			/*
			if(document.getElementById(type + data.date + data[1]) == null) {
				let info = document.createElement('table');
				let curinfo = document.createElement('tr');
				let curinfocell = document.createElement('th');
				curinfocell.innerHTML = data[a];
				if(a == 0) {
					if(!iscourt) {
						curinfocell.innerHTML += '<div id = "billreveal" onclick = "revealBill(' + allbills.length + ')">' + linkpic + '</div>';
						allbills.push(data[data.length - 1]);
					}
					else {
						curinfocell.innerHTML += '<div id = "billreveal" onclick = "showCase(\'https:/' + data[data.length - 1] + '\')">' + linkpic + '</div>';
					}
				}
				switch(a) {
					case(0): curinfocell.style.backgroundColor = '#ffd700'; break;
					case(1): curinfocell.style.backgroundColor = '#ffd744'; break;
					case(2): curinfocell.style.backgroundColor = '#ffd788'; break;
				}
				curinfo.appendChild(curinfocell);
				info.appendChild(curinfo);
				
				info.id = type + data[0] + data[1];
				info.className = 'infotable';
				whichrow.appendChild(info);
			}
			else {
				
			}
			*/
		}
	}	
}