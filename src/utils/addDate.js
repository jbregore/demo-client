function addDate(from, byDays) {
    // Get the current date
    var currentDate = new Date(from);

    // Add three days to the current date
    var futureDate = new Date(currentDate.getTime() + (byDays * 24 * 60 * 60 * 1000));

    // Extract the year, month, and day from the future date
    var year = futureDate.getFullYear();
    var month = ('0' + (futureDate.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based index
    var day = ('0' + futureDate.getDate()).slice(-2);

    // Construct the string representation of the future date in YYYY-MM-DD format
    return year + '-' + month + '-' + day;
}

export default addDate;