var scheduler = {

    planDate: null,
    workStartHour: 9, // 9 AM
    workEndHour: 17,  // 5 PM
    eventsList: [],

    displayCurrentDay: function () {
        var currentDayEl = document.getElementById("currentDay");
        currentDayEl.innerHTML = this.planDate.format("dddd, MMMM Do");
    },

    showPlan: function (dateObj) {
        this.planDate = moment(dateObj);
        this.displayCurrentDay();
        this.loadEvents();
        this.renderTimeBlocks();
    },

    getMatchingEventItem: function (eventPlanTime) {
        var eventObj = null;
        var eventTime = moment(eventPlanTime).format();
        for (var i = 0; i < this.eventsList.length; i++) {
            // Find the matching event
            if (this.eventsList[i].eventTime == eventTime) {
                eventObj = this.eventsList[i];
                break;
            }
        }
        return eventObj;
    },

    renderTimeBlocks: function () {
        var timeBlocksContainerEl = $("#timeBlocksContainer");
        // Clear all child elements if rendered previously
        timeBlocksContainerEl.empty();
        var currentTime = moment();
        for (var i = this.workStartHour; i <= this.workEndHour; i++) {

            var planTime = moment(this.planDate);
            planTime.seconds(0).minutes(0).hour(i);

            //Refer Doc: https://api.jquery.com/jQuery/#jQuery-html-attributes

            var hourEl = $("<div></div>", {
                "class": "col-sm-1 hour"
            });
            hourEl.html(planTime.format("hA"));

            var descriptionEl = $("<textarea></textarea>", {
                "class": "col-sm-10 description"
            });

            //Refer Doc: https://api.jquery.com/addClass/ 
            if (planTime.isBefore(currentTime, "hour")) {
                descriptionEl.addClass("past");
            } else if (planTime.isAfter(currentTime, "hour")) {
                descriptionEl.addClass("future");
            } else {
                descriptionEl.addClass("present");
            }

            // Get matching event from the list and display the event description
            var savedEventObj = this.getMatchingEventItem(planTime.toDate());
            if (savedEventObj != null) {
                descriptionEl.val(savedEventObj.eventDescription);
            }

            var saveBtnEl = $("<button></button>", {
                "class": "col-sm-1 saveBtn"
            });
            saveBtnEl.html("<span class='fa fa-save'></span>");
            saveBtnEl.data("event-time", moment(planTime.toDate()).format());

            var timeBlockRow = $("<div></div>", {
                "class": "row"
            });
            timeBlockRow.append(hourEl)
                .append(descriptionEl)
                .append(saveBtnEl);

            //Refer Doc: https://api.jquery.com/click/
            saveBtnEl.click(onSaveBtnClick);

            timeBlocksContainerEl.append(timeBlockRow);
        }
    },

    // Load events list from the local storage
    loadEvents: function () {
        var eventsListKey = "events-list-" + this.planDate.format("YYYY-MM-DD");
        this.eventsList = JSON.parse(localStorage.getItem(eventsListKey));
        if (this.eventsList == null) this.eventsList = [];
        console.log(this.eventsList);
    },

    // Save events list to the local storage
    saveEvents: function () {
        var eventsListKey = "events-list-" + this.planDate.format("YYYY-MM-DD");
        localStorage.setItem(eventsListKey, JSON.stringify(this.eventsList));
        this.renderTimeBlocks();
    },

    init: function () {
        this.showPlan(moment());
    }
};

// Save button event handler
function onSaveBtnClick(event) {
    var saveBtn = $(this);
    //Refer Doc: https://api.jquery.com/prev/
    var descTextEl = saveBtn.prev("textarea");
    var eventObj = {
        eventTime: moment(saveBtn.data("event-time")).format(),
        eventDescription: descTextEl.val()
    }
    var eventFound = false;
    for (var i = 0; i < scheduler.eventsList.length; i++) {
        // Find the matching event
        if (scheduler.eventsList[i].eventTime == eventObj.eventTime) {
            // Update the description of the matching event object
            scheduler.eventsList[i].eventDescription = eventObj.eventDescription;
            eventFound = true;
            // Exit the loop
            break;
        }
    }

    // Add the eventObj to the list if not already saved
    if (!eventFound) {
        scheduler.eventsList.push(eventObj);
    }
    scheduler.saveEvents();
}

scheduler.init();