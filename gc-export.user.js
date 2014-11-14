// ==UserScript==
// @name        PECH Pronet Employee Costsheet Helper
// @namespace   http://gitlab.huntfield35.nl/axon/pech
// @author      Mathijs de Kruyf
// @contributor Wouter van Rooy
// @version     2014.10.02
// @description Something clever should go here!
// @match       https://pronet05.myprotime.be/ProNetEE.premnat05/Forms/BasicSkeleton.aspx?Nav=EmployeeCostSheet*
// @copyright   2012+, Mathijs de Kruyf (hpmdekruyf@gmail.com)
// @require     https://raw.githubusercontent.com/pimterry/loglevel/master/dist/loglevel.min.js
// @require     http://gitlab.huntfield35.nl/axon/pech/raw/develop/banana.js?v=2014.10.02
// ==/UserScript==

var COST_HISTORY = 'cost_history';
var _projectCostLinks = new Protime.ProCostSheet.Hashtable();
var _gmValues = GM_listValues();
if ( _gmValues.indexOf( COST_HISTORY ) === -1 )
{
    GM_setValue( COST_HISTORY, false );
}
var _costHistory = JSON.parse( GM_getValue( COST_HISTORY ) );

GM_addStyle( "#costHistorySelect { list-style-type: none; padding: 0; } " );
GM_addStyle( "#costHistorySelect li { margin: 5px; padding: 5px; width: 75%; } " );
GM_addStyle( "#pechRunning { margin: 10px; } " );
GM_addStyle( "#pechRunning img { vertical-align:middle; } " );
GM_addStyle( " form.paypal-form { display : inline; } " );
GM_addStyle( " form.paypal-form input { vertical-align:middle; } " );

/* Reverse Cost History insertion, while it is displayed in descending order */
setTimeout( InsertCostHistory, 500, _costHistory.length - 1 );

if ( !String.format )
{
    String.format = function ( format )
    {
        var args = Array.prototype.slice.call( arguments, 1 );
        return format.replace( /{(\d+)}/g, function ( match, number )
        {
            return typeof args[ number ] != 'undefined' ? args[ number ] : match;
        } );
    };
}

function AddCostToCostHistory( cost )
{
    if ( cost == false )
    {
        return;
    }
    var costHistory = JSON.parse( GM_getValue( COST_HISTORY ) );
    costHistory = costHistory || [];
    if ( costHistory.indexOf( cost ) === -1 )
    {
        while ( costHistory.length >= 5 )
        {
            /* Remove first element */
            costHistory.shift();
        }
        costHistory.push( cost );
        GM_setValue( COST_HISTORY, JSON.stringify( costHistory ) );
    }
}

function InsertLinkByDayIndex( dayIndex, link )
{
    if ( _projectCostLinks.ContainsKey( dayIndex ) === false )
    {
        log.info( "Adding key " + dayIndex + " to hashmap" );
        _projectCostLinks.Put( dayIndex, [] );
    }
    if ( _projectCostLinks.Get( dayIndex ).indexOf( link ) == -1 )
    {
        log.info( "Pushing value " + link.id + " to key " + dayIndex );
        _projectCostLinks.Get( dayIndex ).push( link );
        return true;
    }
    return false;
}

function pechLogHeader( header, level )
{
    level = level || "info";
    var lineWidth = 32;
    var padding = lineWidth - header.length;
    var paddingLeft = padding / 2;
    var paddingRight = padding - paddingLeft;
    var message = "";
    for ( var i = 0 ; i < paddingLeft ; i++ )
    {
        message += "=";
    }
    message += " " + header + " ";
    for ( i = 0 ; i < paddingRight ; i++ )
    {
        message += "=";
    }
    log[ level ]( message );
}

function SetDurationForCost( duration, cost )
{
    if ( duration == false )
    {
        return;
    }
    log.info( "Setting duration " + duration.ToString() );
    var textBox = document.getElementById( DurationFieldTextBox );
    if ( textBox == false )
    {
        log.error( DurationFieldTextBox + " not found" );
        return;
    }
    var hoursAndMinutes = textBox.value;
    var currTime = TimeConvertor.Convert( hoursAndMinutes );
    if ( (currTime.GetTotalMinutes() > 0) && (currTime.GetTotalMinutes() !== duration.GetTotalMinutes()) )
    {
        /* Already filled in  and about to change*/
        var inner = '<div>';
        inner += '<h2>Warning!</h2>';
        inner += '<p>Already filled cost <b>' + currTime.ToString() + '</b> is about to be overwritten by the calculated remaining cost <b>' + duration.ToString() + '</b>.</p>';
        inner += '<p>Do you want to Overwrite (' + duration.ToString() + '), Keep (' + currTime.ToString() + ') or Reset (' + CellType.ZeroDurationContent + ') the cost?</p>';
        inner += '<p><small>Hint: Press Esc to discard this dialog.</small></p>';
        inner += '</div>';
        log.warn( currTime.ToString() + " --> " + duration.ToString() );
        $( '<div></div>' ).appendTo( 'body' ).html( inner ).dialog( {
            modal     : true,
            title     : 'Warning!',
            zIndex    : 10000,
            autoOpen  : true,
            width     : 'auto',
            resizable : false,
            buttons   : {
                Overwrite : function ()
                {
                    textBox.value = duration.ToString();
                    $( this ).dialog( "close" );
                },
                Keep      : function ()
                {
                    /* Nothing to be done */
                    $( this ).dialog( "close" );
                },
                Reset     : function ()
                {
                    textBox.value = CellType.ZeroDurationContent;
                    $( this ).dialog( "close" );
                }
            },
            close     : function ( event, ui )
            {
                $( this ).remove();
            }
        } );
    }
    else
    {
        textBox.value = duration.ToString();
    }
    AddCostToCostHistory( cost );
}

function OnCellCostNewClicked( event )
{
    if ( event.toElement != this )
    {
        return false;
    }
    var link = this.querySelector( 'a[id^="lkcostnew"]' );
    if ( (link !== null) && ($( this ).hasClass( "SelectedCost" ) === true) )
    {
        link.click();
    }
    return false;
}

function OnLinkCostNewClicked( event )
{
    if ( event.toElement != this )
    {
        return false;
    }
    var links;
    var link = this;
    var days = _projectCostLinks.Keys();
    var day = -1;
    for ( var idx = 0 ; idx < days.length, day < 0 ; idx++ )
    {
        var tmpDay = days[ idx ];
        links = _projectCostLinks.Get( tmpDay );
        for ( ndx = 0 ; ndx < links.length ; ndx++ )
        {
            var tmpLink = links[ ndx ];
            if ( tmpLink.id === link.id )
            {
                day = tmpDay;
                break;
            }
        }
    }
    if ( day < 0 )
    {
        log.error( "Link " + link.id + " was not found in hashmap(s)" );
        return false;
    }
    var acs = Protime.ProCostSheet.ParentControl._mAllCells;
    var cbdi = Protime.ProCostSheet.ParentControl._mCellsByDayIndex;
    var hw = Protime.ProCostSheet.CostSheetOrchestrator._mCostsHoursQualified._mHoursSummaryAggregator.GetHoursWorked().GetDurationForDay( day );
    /* cbdi is 1 indexed */
    var dayCells = cbdi.Get( idx );
    var costCells = [];
    for ( var ndx = 0 ; ndx < dayCells.length ; ndx++ )
    {
        var costId = dayCells[ ndx ];
        var cost = document.getElementById( costId );
        if ( cost == false )
        {
            continue;
        }
        if ( costId === link.parentElement.id )
        {
            continue;
        }
        var timesheet = parseInt( cost.attributes.timesheettype.value );
        var entity = cost.attributes.entitytype.value;
        if ( timesheet <= CellTypeFactory.CellType.FillIn )
        {
            if ( entity === Protime.ProCostSheet.EntityType.Cost )
            {
                costCells.push( cost );
            }
        }
    }
    var remaining = hw;
    for ( var ndx = 0 ; ndx < costCells.length ; ndx++ )
    {
        var pc = costCells[ ndx ];
        var hoursAndMinutes = (pc.firstChild.innerText ? pc.firstChild.innerText : (pc.innerText ? pc.innerText : CellType.EmptyFillInContent));
        var costDuration = TimeConvertor.Convert( hoursAndMinutes );
        log.info( day + ": Subtracting cost duration " + costDuration.GetTotalMinutes() + " ( " + costDuration.ToString() + " )" + " from remaining duration " + remaining.GetTotalMinutes() + " ( " + remaining.ToString() + " )" );
        remaining = remaining.Substract( costDuration );
    }
    log.info( day + ": Remaining duration " + remaining.GetTotalMinutes() + " ( " + remaining.ToString() + " )" );
    var cost = link.parentElement.attributes.costelementsids.value;
    setTimeout( SetDurationForCost, 100, remaining, cost );
    return false;
}

function ScanNewCostLinks()
{
    var links = tst.querySelectorAll( 'a[id^="lkcostnew"]' );
    /* Always use lkcostnew for length determination, while it lags the costnew length */
    for ( var idx = 0 ; idx < links.length ; idx++ )
    {
        var cbdi = Protime.ProCostSheet.ParentControl._mCellsByDayIndex;
        var acs = Protime.ProCostSheet.ParentControl._mAllCells;
        var link = links[ idx ];
        var cost = link.parentElement;
        var day = (cost.attributes.day ? cost.attributes.day.value : -1);
        var inserted = InsertLinkByDayIndex( day, link );
        if ( inserted === true )
        {
            cost.addEventListener( 'click', OnCellCostNewClicked, false )
            link.addEventListener( 'click', OnLinkCostNewClicked, false )
        }
    }
}

function ManageCostHistory()
{
    var costHistory = JSON.parse( GM_getValue( COST_HISTORY ) );
    var inner = '<div>';
    inner += '<h2>Manage Cost History</h2>';
    inner += '<p>The costs are sortable so you can arrange (drag and drop) them in any order you want.</p>';
    inner += '<p>Select one or more costs to mark them for deletion.</p>';
    inner += '<ul id="costHistorySelect">';
    for ( var idx = 0 ; idx < costHistory.length ; idx++ )
    {
        var costIds = costHistory[ idx ].split( ',', CostStructureView.Categories.length );
        if ( costIds.length !== 2 )
        {
            continue;
        }
        inner += '<li class="ui-state-default">';
        inner += '<input type="checkbox" name="costHistory" value="' + costIds + '">';
        for ( var ndx = 0 ; ndx < CostStructureView.Categories.length ; ndx++ )
        {
            $( "#CategoryId" + ndx ).val( costIds[ ndx ] );
            inner += $( "#CategoryId" + ndx + ' option:selected' ).text();
            inner += ', ';
        }
        /* Trim last ', ' */
        inner = inner.substring( 0, inner.length - 2 );
        inner += '</li>';
    }
    inner += '</ul>';
    inner += '<p><b>This cannot be undone.</b></p>';
    inner += '<p>The changes will be visible after page a refresh.</p>';
    inner += '<p><small>Hint: Press Esc to discard this dialog.</small></p>';
    inner += '</div>';
    $( '<div></div>' ).appendTo( 'body' ).html( inner ).dialog( {
        modal     : true,
        title     : 'Manage Cost History',
        zIndex    : 10000,
        autoOpen  : true,
        width     : 'auto',
        resizable : false,
        buttons   : {
            'Delete All'      : function ()
            {
                GM_setValue( COST_HISTORY, false );
                $( this ).dialog( "close" );
            },
            'Delete Selected' : function ()
            {
                var remainingCosts = [];
                var selected = $( "#costHistorySelect input:checked" ).map( function ()
                {
                    return this.value;
                } ).get();
                for ( idx = 0 ; idx < costHistory.length ; idx++ )
                {
                    costIds = costHistory[ idx ];
                    if ( selected.indexOf( costIds ) === -1 )
                    {
                        remainingCosts.push( costIds );
                    }
                }
                GM_setValue( COST_HISTORY, JSON.stringify( remainingCosts ) );
                $( this ).dialog( "close" );
            },
            'Save Sorted'     : function ()
            {
                var sortedCosts = $( "#costHistorySelect input" ).map( function ()
                {
                    return this.value;
                } ).get();
                GM_setValue( COST_HISTORY, JSON.stringify( sortedCosts ) );
                $( this ).dialog( "close" );
            },
            Keep              : function ()
            {
                /* Nothing to be done */
                $( this ).dialog( "close" );
            },
            Cancel            : function ()
            {
                /* Nothing to be done */
                $( this ).dialog( "close" );
            }
        },
        close     : function ( event, ui )
        {
            $( this ).remove();
        }
    } );
    $( "#costHistorySelect" ).sortable();
}

log.setLevel( "trace" );
//log.setLevel("silent")
pechLogHeader( "Welcome to PECH, in the lines below you can view the verbosity of the logging" );
log.trace( "Log Trace" );
log.debug( "Log Debug" );
log.info( "Log Info" );
log.warn( "Log Warn" );
log.error( "Log Error" );
/* Time Sheet Table */
var tst = document.getElementById( 'TimeSheetTable' );
var tstNodes = tst.childNodes;
for ( var i = 0 ; i < tstNodes.length ; i++ )
{
    var tstNode = tstNodes[ i ];
    if ( tstNode.nodeName.toLowerCase() == 'tbody' )
    {
        tstNode.addEventListener( 'DOMNodeInserted', ScanNewCostLinks, false );
    }
}
var _scriptInfo = GM_info.script;
var _scriptVersion = _scriptInfo.version;
$( '<a id="manageCostHistoryLink" title="Click to do manage Cost History" href="#" onclick="return false;">Manage Cost History</a>' ).insertAfter( '#commentsMainContainer' ).click( ManageCostHistory );
$( '<marquee id="pechRunning" behavior="alternate">' + _banana + '<span>PECH version ' + _scriptVersion + ' installed properly and is running.' + _paypal + '</span>' + _banana + '</marquee>' ).insertAfter( '#manageCostHistoryLink' );

function InsertCostHistory( inserterIdx )
{
    if ( (inserterIdx >= 0) && (inserterIdx < _costHistory.length ) )
    {
        var oldElement = _costHistory[ inserterIdx ].split( ',', CostStructureView.Categories.length );
        if ( oldElement.length !== 2 )
        {
            return;
        }
        for ( var ndx = 0 ; ndx < CostStructureView.Categories.length ; ndx++ )
        {
            $( "#CategoryId" + ndx ).val( oldElement[ ndx ] );
        }
        inserterIdx--;
        $( '.InsertNewCostButton' ).click();
        setTimeout( InsertCostHistory, 100, inserterIdx )
    }
}
