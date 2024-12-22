//ok I didn't do stats -> I want this game to be skilled based and not character based
//(the style will be the ability... you will have to play to find out... or just read the code ig xD)
//I didn't give 8 character options -> I made it so it's 8 art styles

import {Character} from "../classes/character.js";
//=========================================
//page start

//player variables
const playerSection = $('#playerSection');
let selectedPlayer;
DisplayPlayers();

//avatar style variables
const artStyles = $('.artOption'); //gets all the buttons
let currentStyle = 'adventurer';

//avatar variables
const generateCharacterButton = $('#generateCharacterButton');
const player1AvatarDisplayBox = $('#player1Avatar');
const player2AvatarDisplayBox = $('#player2Avatar');
let player1Avatar;
let player2Avatar

//time slider variables
const timeSlider = $('#timeSlider');

//gameStart variables
const startButton = $('#startButton');
const errorZone = $('#errorTag');

//sound effects
const errorSound = $('#errorSound')[0];
//=========================================
//event handlers

//===========
//Starts Game
//===========
startButton.on('click', () => {
    //hide the error message by default
    errorZone.hide();

    if (!player1AvatarDisplayBox.html().trim() || !player2AvatarDisplayBox.html().trim()) {
        errorZone.text('Both Players Need An Avatar.');
        errorZone.show(); //show the error message
        errorSound.play();
        return; //skip the rest of the code
    }

    const numberOfCards = timeSlider.val()
    sessionStorage.setItem('numberOfCards', JSON.stringify(numberOfCards));

    window.location.href = './gameplay.html';
});

//==================
//Selects the Player
//==================
playerSection.on('click', (event) => {
    const playerClicked = event.target;

    //select the player divs
    const player1Display = $('#player1Display');
    const player2Display = $('#player2Display');

    //if the click was close to player2...
    if(playerClicked.closest('#player2Display'))
    {
        selectedPlayer = 'player2';

        //for css :)
        player2Display.addClass('selected');
        player1Display.removeClass('selected');
    }
    else if(playerClicked.closest('#player1Display'))//if it just wasn't
    {
        selectedPlayer = 'player1';

        //for css :)
        player1Display.addClass('selected');
        player2Display.removeClass('selected');
    }
})

//==================
//Art Style Selector
//==================
artStyles.on('click', (event) => {

    //removes the selected from current style
    artStyles.each((index, style) => { //I hate jquery for not working with regular js stuff smh
        if (style.id === currentStyle)
        {
            $(style).removeClass('selected');
        }
    })

    //sets you current style
    currentStyle = event.target.id;

    //makes it selected
    $(event.target).addClass('selected');
})

//===============
//Updates minutes
//===============
timeSlider.on('input', () => {
    $('#currentDuration').text(`${timeSlider.val()} cards`);
});

//=====================
//Generates a Character
//=====================
generateCharacterButton.on('click', () => {
    errorZone.hide();//yes we need to hide it here too...
    //gets an id for the image (for later)
    const id = Math.random().toString(36).substr(2);
    const backgroundColor = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'); //thank you reddit :D

    if (selectedPlayer === undefined)
    {
        errorZone.text('You Must Select A Player To Generate An Avatar For.');
        errorZone.show(); //show the error message
        errorSound.play();
    }
    else if (selectedPlayer === 'player1')
    {
        //displays the image
        player1AvatarDisplayBox.html(DisplayAvatar(id, backgroundColor));

        player1Avatar = new Character(id, currentStyle, backgroundColor);
        sessionStorage.setItem('player1Avatar', JSON.stringify(player1Avatar));
    }
    else if (selectedPlayer === 'player2')
    {
        //displays the image
        player2AvatarDisplayBox.html(DisplayAvatar(id, backgroundColor));

        player2Avatar = new Character(id, currentStyle, backgroundColor);
        sessionStorage.setItem('player2Avatar', JSON.stringify(player2Avatar));
    }
})
//=========================================
//functions

//==============
//Player display
//==============
function DisplayPlayers()
{
    //get players
    const player1 = JSON.parse(sessionStorage.getItem('player1'));
    const player2 = JSON.parse(sessionStorage.getItem('player2'));

    //display player 1
    const player1Name = $('#player1Name');
    player1Name.text(player1.name);

    //display player 2
    const player2Name = $('#player2Name');
    player2Name.text(player2.name);
}

//==================
//displays an avatar
//==================
function DisplayAvatar(seed, backgroundColor) {
    return `
        <img class="avatarImg" src="https://api.dicebear.com/9.x/${currentStyle}/svg?seed=${seed}&backgroundColor=${backgroundColor}"/>
    `; //yaaaa ik there's no fetching for this api... :(  my other api has fetching tho...
    //also there's no "alt" for a reason...
}

//=========================================
//intersection observer api

//=================
//Lazy Loads Images
//=================
const handleIntersect = (entry, observer) => {
    if (entry[0].isIntersecting) {
        const img = entry[0].target;
        img.attr('src', img.data('src')); //jquery voodoo magic
        observer.unobserve(entry[0].target); //we stop looking
    }
};

//the observer
const observer = new IntersectionObserver(handleIntersect);

//the images
$('.avatarImg').each((img) => {
    observer.observe(img);
});