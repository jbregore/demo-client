function compareDates(fromDate, toDate) {
    // Convert the date strings to Date objects
    var from = new Date(fromDate);
    var to = new Date(toDate);

    const difference = to - from;

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

export default compareDates;