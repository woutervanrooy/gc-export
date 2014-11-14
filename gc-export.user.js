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

var elecMonths = elecTable.querySelectorAll('ul');
log.info("Found " + elecMonths.length + " months");

for (var i = 0; i < elecMonths.length; i ++)
{
	var records = elecMonths[i].querySelectorAll('div.row, div.alternating-row');
	log.info("Found " + records.length + " records for month " + i);
	
	for (var j = 0; j < records.length; j++)
	{
		var fields = records[j].childNodes;
		
		var date	= fields[1].innerHTML;
		var rec_hi	= fields[3].innerHTML;
		var rec_lo	= fields[5].innerHTML;
		var remarks	= fields[7].innerHTML;
		
		log.info("Found record. Date: " + date + " High: " + rec_hi + " Low: " + rec_lo + " Remarks: " + remarks);
	}
}
