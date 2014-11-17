// ==UserScript==
// @name        GreenChoice meter records export script
// @namespace   https://dev.nullpointer.nl/energy/gc-export
// @author      Wouter van Rooy
// @version     2014.11.17
// @description This user script helps you export the meter records from your personal GreenChoice file.
// @match       https://dossier.greenchoice.nl/Mijn-Dossier/Mijn-verbruik.aspx*
// @copyright   2014, Wouter van Rooy
// @require     https://raw.githubusercontent.com/pimterry/loglevel/master/dist/loglevel.min.js
// ==/UserScript==

var TAB_VIEW_ID = 'ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenLi';
var TAB_RECORD_VIEW_ID = 'ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenView';
var ELEC_TABLE_ID = 'ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenUserControl_GeordendStandenOverzichtStroom';
var GAS_TABLE_ID = 'ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenUserControl_GeordendStandenoverzichtGas';

var csv_electricity = '';
var csv_gas = '';

var export_button = document.createElement('a');
export_button.innerHTML = '<a id="ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenUserControl_ExporterenHyperlink" class="action_button_right xxxl meterstanden_doorgeven_button align_button_middle" href="#">Exporteren</a>';

log.setLevel( "trace" );
//log.setLevel("silent");

function download(filename, text)
{
	var pom = document.createElement('a');
	pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	pom.setAttribute('download', filename);
	pom.click();
}

function getStyleProp(elem, prop){
    if(window.getComputedStyle)
    {
        return window.getComputedStyle(elem, null).getPropertyValue(prop);
    }
    else if(elem.currentStyle)
    {
    	return elem.currentStyle[prop]; //IE
    }
}

function OnElecExportLinkClick(event)
{
	download('electricity.csv', csv_electricity);
}

function OnGasExportLinkClick(event)
{
	download('gas.csv', csv_gas);
}

/*
 * Switch view to meter record history
 */
//var view = document.getElementById('TAB_VIEW_ID');
//SetView(view,'meterstanden');

/*
 * Electricity
 */
function ParseElecTable()
{
	log.info("Processing electricity meter records");
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
			
				csv_electricity += date + ',' + rec_hi + ',' + rec_lo + ',' + remarks + '\n';
				log.info("Date: " + date + " High: " + rec_hi + " Low: " + rec_lo + " Remarks: " + remarks);
			}
		}
	}
	
	// Add export link
	var elecExportLink = document.createElement('a');
	elecExportLink.innerHTML = 'Exporteren';
	elecExportLink.addEventListener('click', OnElecExportLinkClick);
	elecTable.querySelector('div.main').appendChild(elecExportLink);
}

/*
 * Gas
 */
function ParseGasTable()
{
	log.info("Processing gas meter records");
	var gasTable = document.getElementById(GAS_TABLE_ID);
	var gasYears = gasTable.querySelector('ul').children;
	log.info("Found " + gasYears.length + " years");

	for (var year = 0; year < gasYears.length; year++)
	{
		var gasYear = gasYears[year];
		var gasMonths = gasYear.querySelectorAll('ul');
		log.info("Found " + gasMonths.length + " months for year " + year);
	
		for (var month = 0; month < gasMonths.length; month++)
		{
			var gasMonth = gasMonths[month];
			var gasRecords = gasMonth.querySelectorAll('div.row, div.alternating-row');
			log.info("Found " + gasRecords.length + " records for month " + month);
	
			for (var record = 0; record < gasRecords.length; record++)
			{
				var gasRecord = gasRecords[record];
				var fields = gasRecord.querySelectorAll('div.cell');
		
				var date	= fields[0].innerHTML;
				var rec	 	= fields[1].innerHTML;
				var remarks	= fields[2].innerHTML;
			
				csv_gas += date + ',' + rec + ',' + remarks + '\n';
				log.info("Date: " + date + " Record: " + rec + " Remarks: " + remarks);
			}
		}
	}
	
	// Add export link
	var gasExportLink = document.createElement('a');
	gasExportLink.innerHTML = 'Exporteren';
	gasExportLink.addEventListener('click', OnGasExportLinkClick);
	gasTable.querySelector('div.main').appendChild(gasExportLink);
}


// Wait for page to load before processing
window.addEventListener('load', function() {
    ParseElecTable();
	ParseGasTable();
}, false);
