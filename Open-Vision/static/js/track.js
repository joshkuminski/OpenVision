document.getElementById('track-btn').addEventListener('click', function() {
    // Use JavaScript to initiate Python script execution.
    // This example uses the Fetch API to make an HTTP request to the Python script.
    fetch('C:/Users/hsojh/PycharmProjects/OpenVision/OV_track.py')
        .then(response => response.text())
        .then(data => {
            console.log(data); // Output from the Python script
            alert('Python script executed.');
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
