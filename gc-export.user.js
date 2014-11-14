// ==UserScript==
// @name        GreenChoice meter records export script
// @namespace   https://dev.nullpointer.nl/energy/gc-export
// @author      Wouter van Rooy
// @version     2014.11.14
// @description This user script helps you export the meter records from your personal GreenChoice file.
// @match       https://dossier.greenchoice.nl/Mijn-Dossier/Mijn-verbruik.aspx
// @copyright   2014, Wouter van Rooy
// @require     https://raw.githubusercontent.com/pimterry/loglevel/master/dist/loglevel.min.js
// ==/UserScript==

var ELEC_TABLE_ID = 'ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenUserControl_GeordendStandenOverzichtStroom';
var GAS_TABLE_ID = 'ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenUserControl_GeordendStandenoverzichtGas';

log.setLevel( "trace" );
//log.setLevel("silent");


var view = document.getElementById('ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenLi');
SetView(view,'meterstanden');

var elecTable = document.getElementById(ELEC_TABLE_ID);
var elecYears = elecTable.querySelector('ul').children;
log.info("Found " + elecYears.length + " years");

for (var year = 0; year < elecYears.length; year++)
{
	var elecYear = elecYears[year];
	var elecMonths = elecYear.querySelectorAll('ul');
	log.info("Found " + elecMonths.length + " months for year " + year);
	
	for (var month = 0; month < elecMonths.length; month++)
	{
		var elecMonth = elecMonths[month];
		var elecRecords = elecMonth.querySelectorAll('div.row, div.alternating-row');
		log.info("Found " + elecRecords.length + " records for month " + month);
	
		for (var record = 0; record < elecRecords.length; record++)
		{
			var elecRecord = elecRecords[record];
			var fields = elecRecord.querySelectorAll('div.cell');
		
			var date	= fields[0].innerHTML;
			var rec_hi	= fields[1].innerHTML;
			var rec_lo	= fields[2].innerHTML;
			var remarks	= fields[3].innerHTML;
		
			log.info("Found record. Date: " + date + " High: " + rec_hi + " Low: " + rec_lo + " Remarks: " + remarks);
		}
	}
}
