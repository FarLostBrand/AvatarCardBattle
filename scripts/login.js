import {Player} from "../classes/player.js";

const form = $('#loginForm')

//when the submit button is clicked
form.on('submit', (event) => {
    //prevent default form stuff
    event.preventDefault();

    //===========================
    //gets info from input fields
    //===========================
    //Player 1
    const player1Name = $('#player1Name').val();

    //Player 2
    const player2Name = $('#player2Name').val();

    //================
    //input validation
    //================
    //error tag
    const errorZone = $('#errorTag');
    //hide the error message by default
    errorZone.hide();

    //player names
    if(player1Name === '' || player2Name === '')
    {
        errorZone.text('Missing Player Name.');
        errorZone.show(); //show the error message xD
        return; //this skips the rest of the code
    }

    //===========
    //saving data
    //===========

    //fun fact, you need to do this to feed into session storage. (you cant initiate inside session storage)
    const player1 = new Player(player1Name);
    const player2 = new Player(player2Name);

    sessionStorage.setItem('player1', JSON.stringify(player1));
    sessionStorage.setItem('player2', JSON.stringify(player2));

    window.location.href = './pages/character-selection.html';
})

//modal stuff

//============
//Gets read me
//============
$('#READMEButton').on("click", async () => {
    try {
        const response = await fetch("README.md");

        if (!response.ok)
            throw new Error('Could not get the README.md');

        const markdown = await response.text(); //we want the stuff from readme
        const htmlContent = marked.parse(markdown); //we make the markdown html

        $("#readmeContent").html(htmlContent); //we shove the stuff into here
        $('#readmeModal').fadeIn(); //lovely fadein effect
    } catch (error) {
        $("#readmeContent").text(error.message);
        $("#readmeModal").fadeIn(); //we keep the lovely fadein effect
    }
});

//=================================
//Closes modal when you click the x
//=================================
$('.closeButton').on('click', () => {
    $('#readmeModal').fadeOut();
});


