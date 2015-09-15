/*
 * This file is part of GC-Export.
 * 
 * GC-Export is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Foobar is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

// ==UserScript==
// @name        GreenChoice meter records export script
// @namespace   https://dev.nullpointer.nl/energy/gc-export
// @author      Wouter van Rooy
// @version     1.1.0
// @description This user script helps you export the meter records from your personal GreenChoice file.
// @match       https://dossier.greenchoice.nl/Mijn-Dossier/Mijn-verbruik.aspx*
// @match       https://dossier.greenchoice.nl/mijn-dossier/mijn-verbruik.aspx*
// @grant       none 
// @copyright   2014, Wouter van Rooy
// ==/UserScript==
 
const ELEC_TABLE_ID = 'ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenUserControl_GeordendStandenOverzichtStroom';
const GAS_TABLE_ID = 'ctl00_ctl00_Content_ContentRightPlaceholder_MeterstandenUserControl_GeordendStandenoverzichtGas';

var csv_electricity = '';
var csv_gas = '';

var elecRecordCount = 0;
var gasRecordCount = 0;

var elecMinDate = 0;
var elecMaxDate = 0;
var gasMinDate = 0;
var gasMaxDate = 0;

function downloadCSV(filename, text)
{
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function OnElecExportLinkClick()
{
    downloadCSV('electricity.csv', csv_electricity);
}

function OnGasExportLinkClick()
{
    downloadCSV('gas.csv', csv_gas);
}

function ParseDate(dateString)
{
    // Parse [d]d-[m]m-yyyy into Date object
    var chunks = dateString.split('-');
    var d = parseInt(chunks[0]);
    var m = parseInt(chunks[1]);
    var y = parseInt(chunks[2]);
    
    return new Date(y, m-1, d);
}

function FormatDate(dateObject)
{
    // Parse Date object into [d]d-[m]m-yyyy
    var dateString = dateObject.getDate() + "-" + (dateObject.getMonth()+1) + "-" + dateObject.getFullYear();
    return dateString;
}

/*
 * Electricity
 */
function ParseElecTable()
{
    console.log("Processing electricity meter records");
    var elecTable = document.getElementById(ELEC_TABLE_ID);
    var elecYears = elecTable.querySelector('ul').children;
    //console.log("Found " + elecYears.length + " years");

    for (var year = 0; year < elecYears.length; year++)
    {
        var elecYear = elecYears[year];
        var elecMonths = elecYear.querySelectorAll('ul');
        //console.log("Found " + elecMonths.length + " months for year " + year);

        for (var month = 0; month < elecMonths.length; month++)
        {
            var elecMonth = elecMonths[month];
            var elecRecords = elecMonth.querySelectorAll('div.row, div.alternating-row');
            elecRecordCount += elecRecords.length;
            //console.log("Found " + elecRecords.length + " records for month " + month);

            for (var record = 0; record < elecRecords.length; record++)
            {
                var elecRecord = elecRecords[record];
                var fields = elecRecord.querySelectorAll('div.cell');

                var date    = fields[0].innerHTML;
                var rec_hi  = fields[1].innerHTML;
                var rec_lo  = fields[2].innerHTML;
                var remarks = fields[3].innerHTML;
                
                var date_parsed = ParseDate(date);

                // Re-calculate min/max date
                if (elecMinDate == 0 || date_parsed < elecMinDate)
                {
                    elecMinDate = date_parsed;
                }
                if (elecMaxDate == 0 || date_parsed > elecMaxDate)
                {
                    elecMaxDate = date_parsed;
                }

                // Add to CSV
                csv_electricity += date + ',' + rec_hi + ',' + rec_lo + ',' + remarks + '\n';
                //console.log("Date: " + date + " High: " + rec_hi + " Low: " + rec_lo + " Remarks: " + remarks);
            }
        }
    }
    
    console.log("Found " + elecRecordCount + " electricity records ranging from " + FormatDate(elecMinDate) + " to " + FormatDate(elecMaxDate));

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
    console.log("Processing gas meter records");
    var gasTable = document.getElementById(GAS_TABLE_ID);
    var gasYears = gasTable.querySelector('ul').children;
    
    //console.log("Found " + gasYears.length + " years");

    for (var year = 0; year < gasYears.length; year++)
    {
        var gasYear = gasYears[year];
        var gasMonths = gasYear.querySelectorAll('ul');
        //console.log("Found " + gasMonths.length + " months for year " + year);

        for (var month = 0; month < gasMonths.length; month++)
        {
            var gasMonth = gasMonths[month];
            var gasRecords = gasMonth.querySelectorAll('div.row, div.alternating-row');
            gasRecordCount += gasRecords.length;
            //console.log("Found " + gasRecords.length + " records for month " + month);

            for (var record = 0; record < gasRecords.length; record++)
            {
                var gasRecord = gasRecords[record];
                var fields = gasRecord.querySelectorAll('div.cell');

                var date    = fields[0].innerHTML;
                var rec     = fields[1].innerHTML;
                var remarks = fields[2].innerHTML;
                
                var date_parsed = ParseDate(date);

                // Re-calculate min/max date
                if (gasMinDate == 0 || date_parsed < gasMinDate)
                {
                    gasMinDate = date_parsed;
                }
                if (gasMaxDate == 0 || date_parsed > gasMaxDate)
                {
                    gasMaxDate = date_parsed;
                }

                // Add to CSV
                csv_gas += date + ',' + rec + ',' + remarks + '\n';
                //console.log("Date: " + date + " Record: " + rec + " Remarks: " + remarks);
            }
        }
    }
    
    console.log("Found " + gasRecordCount + " gas records ranging from " + FormatDate(gasMinDate) + " to " + FormatDate(gasMaxDate));

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
