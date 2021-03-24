function getData(type) {
	resetDisplay();
	if(type != 'houselobby' || type != 'senatelobby') {
		initializeTable(type);
	}
	socket.emit('connected');
	socket.emit('get' + type + 'data');
}

function resetDisplay() {
	toggleCategories();
	allbills = [];
	compressed = [];
	expanded = [];
	document.getElementById('housetable').innerHTML = '';
	document.getElementById('senatetable').innerHTML = '';
	document.getElementById('appealscourttable').innerHTML = '';
	document.getElementById('houselobbytable').innerHTML = '';
	document.getElementById('senatelobbytable').innerHTML = '';
}

function initializeTable(type) {
	var thetable = document.getElementById(type + 'table');
	var today = new Date();
	var dd = String(today.getDate())/*.padStart(2, '0')*/;
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	today = mm + '/' + dd + '/' + yyyy;
	//console.log(today);
	for(var a = 0; a < 7; a++) {
		if(parseInt(dd) > 0) {
			let newdate = document.createElement('tr');
			newdate.id = type + mm + '-' + dd;
			thetable.appendChild(newdate);
			dd = parseInt(dd) - 1;
		}
		else {
			switch(parseInt(mm)) {
				case(1): dd = 31; mm = 12; break;
				case(2): dd = 31; mm = 1; break;
				case(3): dd = 28; mm = 2; break;
				case(4): dd = 31; mm = 3; break;
				case(5): dd = 30; mm = 4; break;
				case(6): dd = 31; mm = 5; break;
				case(7): dd = 30; mm = 6; break;
				case(8): dd = 31; mm = 7; break;
				case(9): dd = 31; mm = 8; break;
				case(10): dd = 30; mm = 9; break;
				case(11): dd = 31; mm = 10; break;
				case(12): dd = 30; mm = 11; break;
			}
			let newdate = document.createElement('tr');
			newdate.id = mm + '-' + dd;
			console.log(newdate.id);
			newdate.className = type;
			console.log(newdate.className);
			thetable.appendChild(newdate);
		}
	}
}
function addInfoToTable(type, data) {
	var iscourt = false;
	if(type == 'appealscourt') {
		iscourt = true;
	}
	let tempstring = '';
	for(let z = 0; z < data[0].length; z++) {
		if(data[0].charAt(z) != '0') {
			tempstring += data[0].charAt(z);
		}
	}
	data[0] = tempstring;
	console.log(type + data[0]);
	var whichrow = document.getElementById(type + data[0]);
	//console.log(whichrow);
	if(iscourt) {
		//console.log(type + data[0].substring(0, 5));
		//console.log(type + data[0].substring(0, 5));
		/*
		console.log(data[0]);
		let stringtype = type + data[0].substring(0, 5);
		if(stringtype.charAt(stringtype.length - 1) == '-') {
			stringtype = stringtype.substring(0, stringtype.length - 1);
		}
		console.log(stringtype);
		*/
		//console.log(type + data[0].substring(0, data[0].lastIndexOf('-')));
		whichrow = document.getElementById(type + data[0].substring(0, data[0].lastIndexOf('-')));
		//console.log(whichrow);
	}
	let infotypes = ['date', 'title', 'name', 'text'];
	if(iscourt) {
		infotypes = ['date', 'title', 'summary', 'pdf'];
	}
	let linkpic = '<img src = "/client/pics/linkicon.png" width = "30" height = "30">';
	for(var a = 0; a < data.length - 1; a++) {
		if(document.getElementById(type + data[0] + data[1]) == null) {
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
			let curinfo = document.createElement('tr');
			let curinfocell = document.createElement('th');
			curinfocell.innerHTML = data[a];
			if(a == 0) {
				if(!iscourt) {
					curinfocell += '<div id = "billreveal" onclick = "revealBill(' + allbills.length + ')">' + linkpic + '</div>';
					allbills.push(data[data.length - 1]);
				}
				else {
					curinfocell.innerHTML += '<div id = "billreveal" onclick = "showCase(\'https:/' + data[data.length - 1] + '\')">' + linkpic + '</div>';
				}
			}
			/*
			if(a == 2) {
				if(iscourt) {
					let theexpanded = data[a];
					//console.log(theexpanded == '');
					let periodindex = theexpanded.indexOf('.');
					let thecompressed = theexpanded.substring(0, periodindex + 1);
					theexpanded = theexpanded.substring(periodindex + 1);
					if(theexpanded != '') {
						curinfocell.innerHTML = compressed + '..' + '<div class = "expand" onclick = expand(this, ' + compressed.length + ',' + expanded.length + ')>Expand</div>';
						compressed.push(thecompressed);
						expanded.push(theexpanded);
					}
				}
			}
			*/
			switch(a) {
				case(0): curinfocell.style.backgroundColor = '#ffd700'; break;
				case(1): curinfocell.style.backgroundColor = '#ffd744'; break;
				case(2): curinfocell.style.backgroundColor = '#ffd788'; break;
			}
			curinfo.appendChild(curinfocell);
			document.getElementById(type + data[0] + data[1]).appendChild(curinfo);
		}
	}
}

function addLobbyistsToTable(type, data) {
	let replacedlinks = replaceLinks(data, type);
	document.getElementById(type + 'lobbytable').innerHTML = replacedlinks;
}

function replaceLinks(data, type) {
	if(type == 'house') {
		return data.replace(/pdfform/g, "http://disclosures.house.gov/ld/" + "pdfform");
	}
	//hiLighter($(event.target));
	/*
	data = data.replace(/hiLighter($(event.target));/g, "");
	console.log(data.indexOf('hiLighter($(event.target));'));
	*/
	return data.replace(/index.cfm/g, "https://soprweb.senate.gov/" + "index.cfm");
}

function revealBill(index) {
	let meta = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
	let fontsize = '<style> p { font-size: 4vh } </style>';
	window.open().document.write(meta + fontsize + billstylesheet + allbills[index]);
}

function showCase(link) {
	window.open(link);
}

function highlight(element, color) {
	element.style.background = color;
}

function dehighlight(element) {
	element.style.background = 'black';
}

function toggleCategories() {
	let categories = document.getElementsByClassName('categories');
	for(var a = 0; a < categories.length; a++) {
		console.log(categories[a].style.display);
		if(categories[a].style.display == 'none' || categories[a].style.display == '') {
			if(a == 0) {
				document.getElementById('thecategories').style.display = 'block';
			}
			categories[a].style.display = 'block';
		}
		else {
			if(a == 0) {
				document.getElementById('thecategories').style.display = 'none';
			}
			categories[a].style.display = 'none';
		}
	}
}





function hiLighter(donothing) {
	console.log('intermediate');
}
function $(donothing) {
	console.log('intermediate');
}