//Global variable storing socket
var thesocket;

module.exports = {
	getHouseLobby: function(socket) {
		thesocket = socket;
		console.log('starting puppeteer');
		const puppeteer = require('puppeteer');

		let scrape = async () => {
			//Launch a new page
			const browser = await puppeteer.launch({headless: false});
			const page = await browser.newPage();
			//Go to house lobby website
			await page.goto('http://disclosures.house.gov/ld/ldsearch.aspx');
			//Select 'all' for filing type
			await page.click('#radioFilingType_2');
			//Wait
			await page.waitFor(250);
			//Hit search
			await page.click('#cmdSearch');
			//Wait
			await page.waitFor(250);
			//Hit 'last page button'
			await page.click('#btnLast2');
			//Wait again
			await page.waitFor(250);
			//Get tabular results on last page, and return
			const result = await page.evaluate(() => {
				let table = document.querySelector('#GridView1 > tbody').innerHTML;
				return table;
			});

			browser.close();
			return result;
		};

		scrape().then((value) => {
			thesocket.emit('lobbyists', {
				type: 'house',
				lobbyists: value
			});
		});
	}
}
