var base = 'https://law.justia.com';

module.exports = {
   getPastCases: function(socket, courttype) {
		const rp = require('request-promise');
		//const $ = require('cheerio');
		
		//Loop through all appeals courts and send recent cases
		for(var a = 1; a <= 13; a++) {
			let url = base + '/cases/federal/appellate-courts/ca' + a + '/';
			//console.log(url);
			rp(url)
				.then(function(html){
					//success!
					getPastCases(html, socket, courttype, a);
				})
				.catch(function(err){
					//handle error
					console.log('error ' + err);
				});
		}
   }
}

function getPastCases(html, socket, courttype, whichcourt) {
	let datelist = [];
	getLastWeek(datelist);
	//console.log(datelist);
	let currentdate = getToday();
	//console.log(currentdate);
	getCasesOnPage(html, socket);	
}

function getCasesOnPage(html, socket) {
	let caseindicator = '<div class="has-padding-content-block-30 -zb">';
	while(html.indexOf(caseindicator) != -1) {
		console.log('here');
		let startindex = html.indexOf(caseindicator);
		console.log(startindex);
		html = html.substring(startindex + caseindicator.length);
		let endindex = html.indexOf(caseindicator);
		if(endindex != -1) {
			let currentcase = html.substring(0, endindex);
			let link = getCaseLink(currentcase);
			console.log(link);
			
			let date = getCaseDate(currentcase);
			date = convertDate(date);
			
			let datelist = [];
			getLastWeek(datelist);
			let upperbound = compareDate(date, datelist[0]);
			let lowerbound = compareDate(date, datelist[datelist.length - 1]);
			if(upperbound != 1 && lowerbound != -1) {
				console.log(date);
				parseCaseData(link, date, socket);
			}
			else {
				break;
			}
		}
	}
}

function parseCaseData(link, date, socket) {
	const rp2 = require('request-promise');
	rp2(link)
		.then(function(html){
			//success!
			let casedata = [];
			casedata.push(date);
			
			//Look for case title
			let title = getCaseTitle(html);
			console.log(title);
			casedata.push(title);
			
			//Look for case summary
			let summary = getCaseSummary(html);
			console.log(summary);
			casedata.push(summary);
			
			//Look for full case pdf link
			let pdflink = getCasePdf(html);
			console.log(pdflink);
			casedata.push(pdflink);
			
			//Send case data to client side
			socket.emit('casedata', {
				type: 'appealscourt',
				casedata: casedata
			});
		})
		.catch(function(err){
			//handle error
			console.log('error ' + err);
		});
}

function getCaseTitle(html) {
	let titlefinder = 'heading-1';
	html = html.substring(html.indexOf(titlefinder) + titlefinder.length + 2);
	let titleendfinder = '</h1>';
	let title = html.substring(0, html.indexOf(titleendfinder));
	return title;
}

function getCaseSummary(html) {
	let summary = '';
	let summaryfinder = 'text-diminished';
	if(html.indexOf(summaryfinder) != -1) {
		html = html.substring(html.indexOf(summaryfinder));
		let textfinder = '<p>';
		html = html.substring(html.indexOf(textfinder) + textfinder.length);
		let endtextfinder = '</p>';
		summary = html.substring(0, html.indexOf(endtextfinder));				
	}
	return summary;
}

function getCasePdf(html) {
	let pdffinder = 'pdf-icon';
	html = html.substring(0, html.indexOf(pdffinder));
	let pdflinkfinder = '<a href="';
	console.log('86 ' + html.lastIndexOf(pdflinkfinder));
	html = html.substring(html.lastIndexOf(pdflinkfinder) + pdflinkfinder.length + 1);
	let pdfendlinkfinder = '"';
	let pdflink = html.substring(0, html.indexOf(pdfendlinkfinder));
	return pdflink;
}

function getCaseLink(currentcase) {
	let linkindicator = '<a href=';
	let linkindex = currentcase.indexOf(linkindicator) + linkindicator.length + 1;
	currentcase = currentcase.substring(linkindex);
	let endlinkindex = currentcase.indexOf('"');
	let link = base + currentcase.substring(0, endlinkindex);
	return link;
}

function getCaseDate(currentcase) {
	let dateindicator = 'Date:';
	let dateindex = currentcase.indexOf('Date:');
	currentcase = currentcase.substring(dateindex);
	let strong = '</strong>';
	currentcase = currentcase.substring(currentcase.indexOf(strong) + strong.length + 1);
	let enddate = currentcase.indexOf('</span>');
	let date = currentcase.substring(0, enddate);
	return date;
}

function convertDate(datestring) {
	let month = datestring.substring(0, datestring.indexOf(' '));
	datestring = datestring.substring(datestring.indexOf(' ') + 1);
	let day = datestring.substring(0, datestring.indexOf(','));
	datestring = datestring.substring(datestring.indexOf(',') + 2);
	let year = datestring.substring(0);
	switch(month) {
		case('January'): month = 01; break;
		case('February'): month = 02; break;
		case('March'): month = 03; break;
		case('April'): month = 04; break;
		case('May'): month = 05; break;
		case('June'): month = 06; break;
		case('July'): month = 07; break;
		case('August'): month = 08; break;
		case('September'): month = 09; break;
		case('October'): month = 10; break;
		case('November'): month = 11; break;
		case('December'): month = 12; break;
	}
	let newdate = month + '-' + day + '-' + year;
	//console.log(newdate);
	return newdate;
}

//-1 if 1 less than 2, 0 if equal, 1 if 1 greater than 2
function compareDate(date1, date2) {
	let dateone = date1.split('-');
	//console.log(dateone);
	let datetwo = date2.split('-');
	//console.log(datetwo);
	if(datetwo[2] > dateone[2]) {
		return -1;
	}
	else if(datetwo[2] < dateone[2]) {
		return 1;
	}
	else {
		let mdsum1 = dateone[0] + (dateone[1] / 31);
		let mdsum2 = datetwo[0] + (datetwo[1] / 31);
		if(mdsum2 > mdsum1) {
			return -1;
		}
		else if(mdsum1 < mdsum2) {
			return 1;
		}
	}
	return 0;
}

function getToday() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	today = mm + '-' + dd + '-' + yyyy;
	return today;
}

function getLastWeek(datelist) {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	today = mm + '-' + dd + '-' + yyyy;
	//console.log(today);
	for(var a = 0; a < 7; a++) {
		if(parseInt(dd) > 0) {
			datelist.push(mm + '-' + dd + '-' + yyyy);
			dd = parseInt(dd) - 1;
		}
		else {
			switch(parseInt(mm)) {
				case(1): dd = 31; mm = 12; yyyy = parseInt(yyyy) - 1; break;
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
			datelist.push(mm + '-' + dd + '-' + yyyy);
		}
	}
}