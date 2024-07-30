function compareTimes(startTime, endTime) {
    const startParts = startTime.split(":");
    const endParts = endTime.split(":");

    const startHours = parseInt(startParts[0]);
    const startMinutes = parseInt(startParts[1]);
    const endHours = parseInt(endParts[0]);
    const endMinutes = parseInt(endParts[1]);


    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return startTotalMinutes < endTotalMinutes;
}

export default compareTimes;