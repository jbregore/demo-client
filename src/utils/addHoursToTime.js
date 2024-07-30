function addHoursToTime(currentTime, hoursToAdd) {
    var parts = currentTime.split(":");
    var currentHours = parseInt(parts[0]);
    var currentMinutes = parseInt(parts[1]);

    var newHours = currentHours + hoursToAdd;

    newHours = newHours % 24;

    var newTimeHours = ('0' + newHours).slice(-2);
    var newTimeMinutes = ('0' + currentMinutes).slice(-2);

    var newTime = newTimeHours + ':' + newTimeMinutes;

    return newTime;
}

export default addHoursToTime;