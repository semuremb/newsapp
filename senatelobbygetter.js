//Global variable storing socket
var thesocket;

module.exports = {
	getSenateLobby: function(socket) {
		thesocket = socket;
		console.log('starting puppeteer');
		const puppeteer = require('puppeteer');

		let scrape = async () => {
			try {
				//Launch a new page
				const browser = await puppeteer.launch({headless: false});
				const page = await browser.newPage();
				//Go to house lobby website
				await page.goto('https://soprweb.senate.gov/index.cfm?event=selectfields');
				//Select 'country' as a field
				await page.click('body > div:nth-child(2) > div > form > fieldset > div:nth-child(1) > div:nth-child(2) > div > ul > li:nth-child(3) > label > span');
				//Select 'amount reported' as a field
				await page.click('body > div:nth-child(2) > div > form > fieldset > div:nth-child(2) > div:nth-child(1) > div > ul > li:nth-child(2) > label > span');
				//Select 'filing year' as a field
				await page.click('body > div:nth-child(2) > div > form > fieldset > div:nth-child(2) > div:nth-child(1) > div > ul > li:nth-child(5) > label > span');
				//Hit 'submit' button
				await page.click('body > div:nth-child(2) > div > form > fieldset > div.actions > input');
				//Wait
				await page.waitFor(500);
				
				//NEW PAGE
				
				//Select 'USA' for country
				await page.click('#clientCountry > option:nth-child(1)');
				//Enter '1000000' in field asking for minimum $ amount
				await page.type('#amountReported', '1000000');
				//Click operator selector and select >= using arrow keys
				await page.click('#amountReportedOperator');
				for(let a = 0; a < 3; a++) {
					await page.keyboard.press('ArrowDown');
				}
				//Select filing year selector, select most recent year
				await page.select('#filingYear', '2019');
				//Select submit button
				await page.click('body > div:nth-child(2) > form > fieldset > div.actions > input');
				//Wait
				await page.waitFor(3000);
				
				//NEW PAGE
				
				//Click sorting option twice to sort from most recent to least recent
				await page.click('#searchResults > thead > tr > th:nth-child(5)');
				await page.click('#searchResults > thead > tr > th:nth-child(5)');
				//Get tabular results on this page, and return
				const result = await page.evaluate(() => {
					let table = document.querySelector('#searchResults').innerHTML;
					return table;
				});
				browser.close();
				return result;
			}
			catch(err) {
				console.log(err);
			}
		};

		scrape().then((value) => {
			thesocket.emit('lobbyists', {
				type: 'senate',
				lobbyists: value
			});
		});
	}
}