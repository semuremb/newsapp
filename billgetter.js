var base = 'https://www.congress.gov';

module.exports = {
   getPastBills: function(socket, billtype) {
		const rp = require('request-promise');
		//const $ = require('cheerio');
		const url = 'https://www.congress.gov/bills-with-chamber-action/browse-by-date';
		
		rp(url)
			.then(function(html){
				//success!
				getPastBills(html, socket, billtype);
			})
			.catch(function(err){
				//handle error
				console.log('error ' + err);
			});
   }
}

function getPastBills(html, socket, billtype) {
	var datelist = [];
	getLastWeek(datelist);
	//console.log(datelist);
	let toparse = html;
	for(var a = 0; a < datelist.length; a++) {
		let billdata = [];
		let currow = toparse.indexOf('tbody-{year}-' + datelist[a]);
		if(currow != -1) {
			//Get on house floor page for this day
			let floordata = getOnFloor(datelist[a], billdata, currow, toparse, billtype);
			let thelink = floordata[0];
			toparse = toparse.substring(parseInt(floordata[1]));
			//Find bill links on "on house floor" page
			const rp2 = require('request-promise');
			rp2(thelink)
				.then(function(html) {
					findBills(billdata, html, socket, billtype);
				})
				.catch(function(err) {
					//handle error
					console.log('error ' + err);
				});
		}
	}
}

function getLastWeek(datelist) {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	today = mm + '/' + dd + '/' + yyyy;
	console.log(today);
	for(var a = 0; a < 7; a++) {
		if(parseInt(dd) > 0) {
			datelist.push(mm + '-' + dd);
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
			datelist.push(mm + '-' + dd);
		}
	}
}

function getOnFloor(date, billdata, dateindex, toparse, billtype) {
	billdata.push(date);
	toparse = toparse.substring(dateindex);
	let houselinkindex = toparse.indexOf('/on-' + billtype + '-floor');
	toparse = toparse.substring(houselinkindex);
	let endlinkindex = toparse.indexOf('"');
	let houselink = base + toparse.substring(0, endlinkindex);
	let data = [];
	data.push(houselink);
	data.push(endlinkindex);
	return data;
}

function findBills(billdata, html, socket, billtype) {
	let billstoparse = html;
	while(billstoparse.indexOf('/bill/') != -1) {
		let billlinkindex = billstoparse.indexOf('/bill/');
		billstoparse = billstoparse.substring(billlinkindex);
		let endbilllinkindex = billstoparse.indexOf('"');
		let billurl = base + billstoparse.substring(0, endbilllinkindex) + '/text';
		billstoparse = billstoparse.substring(endbilllinkindex);
		/*
		let billurldata = getBillUrl(billstoparse);
		let billurl = billurldata[0];
		console.log('102 ' + parseInt(billurldata[1]));
		billstoparse = billstoparse.substring(parseInt(billurldata[1]));
		*/
		
		const rp3 = require('request-promise');
		rp3(billurl)
			.then(function(html) {
				getBillData(billdata, html, socket, billtype);
			})
			.catch(function(err) {
				//handle error
				console.log('error ' + err);
			});
	}
}

/*
function getBillUrl(billstoparse) {
	let billlinkindex = billstoparse.indexOf('/bill/');
	billstoparse = billstoparse.substring(billlinkindex);
	let endbilllinkindex = billstoparse.indexOf('"');
	let billurl = base + billstoparse.substring(0, endbilllinkindex) + '/text?format=txt';
	billstoparse = billstoparse.substring(endbilllinkindex);
	let data = [];
	data.push(billurl);
	data.push(endbilllinkindex);
	return data;
}
*/

function getBillData(billdata, html, socket, billtype) {
	billdata = [billdata[0]];
	let billtext = html;
	//Find title
	let titlefinderstring = '<h1 class="legDetail">';
	let titleindex = billtext.indexOf(titlefinderstring);
	billtext = billtext.substring(titleindex);
	let titlestring = billtext.substring(titlefinderstring.length, billtext.indexOf('<span'));
	billdata.push(titlestring);
	//Find sponsor
	let sponsorfinderstring = 'Sponsor:';
	let sponsorindex = billtext.indexOf(sponsorfinderstring);
	billtext = billtext.substring(sponsorindex);
	billtext = billtext.substring(billtext.indexOf('href'));
	billtext = billtext.substring(billtext.indexOf('>'));
	let sponsorname = billtext.substring(1, billtext.indexOf('<'));
	billdata.push(sponsorname);
	//Find text
	let textcontainerstring = 'generated-html-container';
	let billtextstart = billtext.indexOf(textcontainerstring);
	billtext = billtext.substring(billtextstart);
	billtext = billtext.substring(billtext.indexOf('<body'));
	let billtextend = billtext.indexOf('</main>');
	let completebilltext = billtext.substring(0, billtextend);
	billdata.push(completebilltext);
	console.log(billdata);
	//Set bill data to client side
	socket.emit('sendbill', {
		type: billtype,
		billdata: billdata
	});
}
