Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--)
    {
        if (this[i] === obj)
        {
            return true;
        }
    }
    return false;
}

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

var $data;

$(document).ready(function()
{
	$.getJSON("sundlaugar.json", function(json)
	{
			$data = json;

			var orderedByOpen = orderByIfItsOpen(json);

			displayData(orderedByOpen);
	});

	$('.sort-by-location').click(function(event)
	{
    event.preventDefault();
		if (navigator.geolocation)
    	{
    		navigator.geolocation.getCurrentPosition(geoLocation);
    	}
	});


  // get the action filter option item on page load
	  var $filterType = $('#filterOptions li.active a').attr('class');

	  // get and assign the ourHolder element to the
	// $holder varible for use later
	  var $holder = $('.pools');

	  // clone all items within the pre-assigned $holder element
	  // var $data = $holder.clone();

	  // attempt to call Quicksand when a filter option
	// item is clicked
	$('#filterOptions li a').click(function(e) {
		// reset the active class on all the buttons
		$('#filterOptions li').removeClass('active');

		// assign the class of the clicked filter option
		// element to our $filterType variable
		var $filterType = $(this).attr('class');
		$(this).parent().addClass('active');


		if ($filterType == 'all') {
			// assign all li items to the $filteredData var when
			// the 'All' filter option is clicked
			var $filteredData = $data.find('li')

			console.log("lol all");
		}
		else {
			// find all li elements that have our required $filterType
			// values for the data-type element
			var $filteredData = $data.find('li[data-type=' + $filterType + ']');

			console.log("lol else");
		}

		// call quicksand and assign transition parameters
		$holder.quicksand($filteredData, {
			duration: 800,
			easing: 'easeInOutQuad'
		});
		return false;
	});
});

function geoLocation(position)
{
	console.log(position);

	var distancePools = new Array();

	for (var s = 0; s < $data.length; s++)
	{
		var tmpPool = $data[s];

		tmpPool.distance = distanceBetweenLocations(position.coords, tmpPool.location)

		distancePools.push(tmpPool);
	}

	var orderedBydistancePools = distancePools.sort(function(a,b){return a.distance-b.distance});

	displayData(orderedBydistancePools);
}

function distanceBetweenLocations(location1, location2)
{

	var R = 6371; // km

	var dLat = (location2.latitude-location1.latitude).toRad();
	var dLon = (location2.longitude-location1.longitude).toRad();

	var lat1 = location1.latitude.toRad();
	var lat2 = location2.latitude.toRad();

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);

	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	return R * c;
}

function getDayTag()
{
	var dayTags = new Array("sun", "mon", "tue", "wed", "thu", "fri", "sat");

	var currentdate = new Date();

	var day = currentdate.getDay();

	return dayTags[day];
}

function isOpen(info)
{
	var currentdate = new Date();

	var currentMinuteTime = currentdate.getHours()*60+currentdate.getMinutes();

	var dayTag = getDayTag();

	return (info.hours[dayTag] && isOpenWithHours(info.hours[dayTag]));
}

function isOpenWithHours(hours)
{
	var currentdate = new Date();

	var currentMinuteTime = currentdate.getHours()*60+currentdate.getMinutes();

	return (minuteTimeFromString(hours.opens) < currentMinuteTime &&
		minuteTimeFromString(hours.closes) > currentMinuteTime);
}

function orderByIfItsOpen(data)
{
	var currentdate = new Date();

	openPools = new Array();
	closedPools = new Array();

	for (var s = 0; s < data.length; s++)
	{
		if(isOpen(data[s]))
		{
			openPools.push(data[s]);
		}
		else
		{
			closedPools.push(data[s])
		}
	}

	return openPools.concat(closedPools);
}

function minuteTimeFromString(timeString)
{
	var partsOfCloses = timeString.split(':');

	closeingHour = parseInt(partsOfCloses[0]);
	closeingMinute = parseInt(partsOfCloses[1]);

	return closeingHour * 60 + closeingMinute;
}

function reorderTimeInfo(info)
{
	var dayTags = new Array("mon", "tue", "wed", "thu", "fri", "sat", "sun");

	var daysWithSameOpeningTime = new Array();

	for (var i = 0; i < dayTags.length; i++)
	{
		var dayTag = dayTags[i];

		if (!info.hours[dayTag])
		{
			break;
		}

		var dayHours = info.hours[dayTag];

		var foundOtherDayWithSameOpeningTime = false;

		for (var d = 0; d < daysWithSameOpeningTime.length; d++)
		{
			if(daysWithSameOpeningTime[d].hours.opens == dayHours.opens &&
				daysWithSameOpeningTime[d].hours.closes == dayHours.closes)
			{
				daysWithSameOpeningTime[d].days.push(dayTag);

				foundOtherDayWithSameOpeningTime = true;

				break;
			}
		}

		if (foundOtherDayWithSameOpeningTime == false)
		{
			var daysObject = { "hours": dayHours, "days": [dayTag] };

			daysWithSameOpeningTime.push(daysObject);
		}
	}

	return daysWithSameOpeningTime;
}

function dayTagToIcelandic(dayTag)
{
	var icelandicDayNames = {
		"mon": "Mánudagur",
		"tue": "Þriðjudagur",
		"wed": "Miðvikudagur",
		"thu": "Fimmtudagur",
		"fri": "Föstudagur",
		"sat": "Laugardagur",
		"sun": "Sunnudagur"
	};

	return icelandicDayNames[dayTag];
}

function dayTagToIcelandicInEf(dayTag)
{
	var icelandicDayNames = {
		"mon": "mánudags",
		"tue": "þriðjudags",
		"wed": "miðvikudags",
		"thu": "fimmtudags",
		"fri": "föstudags",
		"sat": "laugardags",
		"sun": "sunnudags"
	};

	return icelandicDayNames[dayTag];
}

function makeTimeHtml(info)
{
	var daysWithSameOpeningTime = reorderTimeInfo(info);

	var currentDayText = "";
	var otherDaysText = "";

	for (var d = 0; d < daysWithSameOpeningTime.length; d++)
	{
		var daysCount = daysWithSameOpeningTime[d].days.length;

		var firstDayTag = daysWithSameOpeningTime[d].days[0];
		var lastDayTag = daysWithSameOpeningTime[d].days[daysCount-1];

		var firstDayName = dayTagToIcelandic(firstDayTag);
		var lastDayName = dayTagToIcelandicInEf(lastDayTag);

		var openTime = daysWithSameOpeningTime[d].hours.opens+" - "+daysWithSameOpeningTime[d].hours.closes;

		daysWithSameOpeningTime[d].days.contains(getDayTag());

		var timeClass = "";

		var dayName = (daysCount == 1) ? firstDayName : firstDayName+' -  '+lastDayName;

		if (daysWithSameOpeningTime[d].days.contains(getDayTag()))
		{
			timeClass += "pool__hours__current";

			if (!isOpenWithHours(daysWithSameOpeningTime[d].hours))
			{
				timeClass += " pool__hours__current--closed";
			}

			currentDayText =  '<h2 class="' + timeClass +'">' ;
      currentDayText +=   '<span class="pool__hours__current__days">' + dayName + ':</span> ';
      currentDayText +=   '<span class="pool__hours__current__hours">' + openTime + '</span>';
      currentDayText += '</h2>';
		}
		else
		{
			if (otherDaysText != "")
			{
				otherDaysText += ", ";
			}

			otherDaysText += dayName+": "+openTime;
		}
	}

	return currentDayText+"<p>"+otherDaysText+"</p>";
}

function makePoolHtml(info, dayTag)
{

	// var hourClass = (isOpen(info)) ? "" : "closeing";

	var poolHtml = '<li class="pool" data-id="id-'+info.id+'" data-type="league2">'
	poolHtml += '<h2 class="pool__name">'+info.name+'</h2>'

	poolHtml += '<div class="pool__hours">';

	poolHtml += makeTimeHtml(info);

	poolHtml += '</div>';

	return poolHtml;
}

function displayData(data)
{
	dataHtml = "<ul>";

	var dayTag = getDayTag();

	for (var s = 0; s < data.length; s++)
	{
		dataHtml += makePoolHtml(data[s], dayTag);

		// break;
	}

	dataHtml += "</ul>";

	$('.pools').quicksand($(dataHtml).find('li'), {
		duration: 500,
		easing: 'easeOutQuad'
	});

}
