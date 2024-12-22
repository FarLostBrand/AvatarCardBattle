//you never said we were required to use the intersection observer
//api for images on the gameplay page, so I'm using it here.

//variables
//error
const errorZone = $('#errorTag');

//player
let player1Turn = true;
let player1Score = 0;
let player2Score = 0;
let player1Ability = "";
let player2Ability = "";
let player1AbilityValid = true;
let player2AbilityValid = true;
let player1Cards = [];
let player2Cards = [];
DisplayPlayers();
UpdateActivePlayerDisplay()

//cards
const maxNumberOfCards = JSON.parse(sessionStorage.getItem('numberOfCards'));
$('#title').text(`Game Ends When Everyone Has ${maxNumberOfCards} Cards!`) //update title
const maxNumberOfCardsPerTurn = Math.floor(maxNumberOfCards / 2);
let currentCardsDrawThisTurn = 0;

//deck
const deckCreationURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
let deck = await FetchStats(deckCreationURL);
const deckId = deck.deck_id; //I use it often

//buttons
const drawButton = $('#drawCard');
const shuffleButton = $('#shuffleDeck')
const abilityButton = $('#ability');
const endTurn = $('#endTurn');

//sound effects
const errorSound = $('#errorSound')[0];
//=========================================
//event handlers

//=====================
//Draws Card for player
//=====================
drawButton.on('click', async () => {
    errorZone.hide();

    const drawCardURL = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
    const card = await FetchStats(drawCardURL);

    if(player1Turn)
    {
        if(player1Cards.length >= maxNumberOfCards)
        {
            errorZone.text(`You cannot have more than ${maxNumberOfCards} cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }
        else if(currentCardsDrawThisTurn >= maxNumberOfCardsPerTurn)
        {
            errorZone.text(`You cannot draw more than ${maxNumberOfCardsPerTurn} cards per turn.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        player1Cards.push(card.cards[0].code);
        currentCardsDrawThisTurn++;

        if (player1Cards.length !== 1)
            $('#player1NumberOfCards').text(`${player1Cards.length} cards`);
        else
            $('#player1NumberOfCards').text(`${player1Cards.length} card`);

        DisplayCard(true, card.cards[0].code);
    }
    else
    {
        if(player2Cards.length >= maxNumberOfCards)
        {
            errorZone.text(`You cannot have more than ${maxNumberOfCards} cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }
        else if(currentCardsDrawThisTurn >= maxNumberOfCardsPerTurn)
        {
            errorZone.text(`You cannot draw more than ${maxNumberOfCardsPerTurn} cards per turn.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        player2Cards.push(card.cards[0].code);
        currentCardsDrawThisTurn++;

        if (player2Cards.length !== 1)
            $('#player2NumberOfCards').text(`${player2Cards.length} cards`);
        else
            $('#player2NumberOfCards').text(`${player2Cards.length} card`);

        DisplayCard(false, card.cards[0].code);
    }
})

//============
//Shuffle Deck
//============
shuffleButton.on('click', async () => {
    errorZone.hide();

    const shuffleDeckURL = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/?remaining=true`;
    deck = await FetchStats(shuffleDeckURL);
})

//=================
//Activates Ability
//=================
abilityButton.on('click', () => {
    if (player1Turn)
    {
        if(!player1AbilityValid)
        {
            errorZone.text(`You cannot use your ability more than once.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        ActivateAbility(true, player1Ability);
    }
    else
    {
        if(!player2AbilityValid)
        {
            errorZone.text(`You cannot use your ability more than once.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        ActivateAbility(false, player2Ability);
    }
})

//=========
//Ends Turn
//=========
endTurn.on('click', () => {
    errorZone.hide();

    player1Turn = !player1Turn; //webstorm showed me this and it's so cool
    currentCardsDrawThisTurn = 0; //we need to reset this

    UpdateActivePlayerDisplay();

    //this is for when the game is done
    if(player1Cards.length == maxNumberOfCards && player2Cards.length == maxNumberOfCards) //this NEEDS to be == and not ===
    {
        //calculates who wins
        for (let i = 0; i < player1Cards.length; i++)
        {
            let player1Card = GetCardValue(player1Cards[i]);
            let player2Card = GetCardValue(player2Cards[i]);

            if (player1Card > player2Card)
            {
                UpdateScore(true);
            }
            else if (player1Card < player2Card)
            {
                UpdateScore(false);
            }
        }

        UpdatePlayers();
        window.location.href = './gameover.html';
    }
})

//=========================================
//functions

//====================
//Displays the players
//====================
function DisplayPlayers()
{
    //get players
    const player1 = JSON.parse(sessionStorage.getItem('player1'));
    const player2 = JSON.parse(sessionStorage.getItem('player2'));

    const player1Avatar = JSON.parse(sessionStorage.getItem('player1Avatar'));
    const player2Avatar = JSON.parse(sessionStorage.getItem('player2Avatar'));

    player1Ability = player1Avatar.style;
    player2Ability = player2Avatar.style;

    //display player 1
    const player1Name = $('#player1Name');
    player1Name.text(player1.name);

    const player1AvatarDisplay = $('#player1Avatar');
    player1AvatarDisplay.html(`<img class="avatarImg" loading="lazy" src="https://api.dicebear.com/9.x/${player1Avatar.style}/svg?seed=${player1Avatar.id}&backgroundColor=${player1Avatar.color}"/>`)

    //display player 2
    const player2Name = $('#player2Name');
    player2Name.text(player2.name);

    const player2AvatarDisplay = $('#player2Avatar');
    player2AvatarDisplay.html(`<img class="avatarImg" loading="lazy" src="https://api.dicebear.com/9.x/${player2Avatar.style}/svg?seed=${player2Avatar.id}&backgroundColor=${player2Avatar.color}"/>`)
}

//===========================
//Highlights whose turn it is
//===========================
function UpdateActivePlayerDisplay()
{
    if (player1Turn) {
        $('#player1Display').addClass('active');
        $('#player2Display').removeClass('active');
    } else {
        $('#player2Display').addClass('active');
        $('#player1Display').removeClass('active');
    }
}

//===========================
//Updates the image of a card
//===========================
function DisplayCard(isPlayer1, cardCode)
{
    let playerCardImg;

    //gets the right img tag
    if (isPlayer1)
        playerCardImg = $('#playerDeck1Img');
    else
        playerCardImg = $('#playerDeck2Img');

    //sets the image
    playerCardImg.attr('src', `../public/${cardCode}.png`);
}

//====================
//Gets value of a card
//====================
function GetCardValue(cardCode)
{
    switch (cardCode[0]) //we just care about the first guy
    {
        case 'A':
            return 14; //aces always win :D
        case '2':
            return 2;
        case '3':
            return 3;
        case '4':
            return 4;
        case '5':
            return 5;
        case '6':
            return 6;
        case '7':
            return 7;
        case '8':
            return 8;
        case '9':
            return 9;
        case '0':
            return 10;
        case 'J':
            return 11;
        case 'Q':
            return 12;
        case 'K':
            return 13;
    }
}

//================
//Gets card number
//================
function GetCardNumber(value) {
    switch (value) {
        case 14:
            return 'A';
        case 2:
            return '2';
        case 3:
            return '3';
        case 4:
            return '4';
        case 5:
            return '5';
        case 6:
            return '6';
        case 7:
            return '7';
        case 8:
            return '8';
        case 9:
            return '9';
        case 10:
            return '0';
        case 11:
            return 'J';
        case 12:
            return 'Q';
        case 13:
            return 'K';
    }
}


//====================
//Updates player score
//====================
function UpdateScore(isPlayer1)
{
    //gets the right img tag
    if (isPlayer1)
        player1Score++;
    else
        player2Score++;
}

//=========================
//Calls appropriate ability
//=========================
function ActivateAbility(isPlayer1, ability)
{
    if (isPlayer1)
        player1AbilityValid = false;
    else
        player2AbilityValid = false;

    switch (ability) {
        case 'adventurer':
            Adventurer(isPlayer1);
            break;
        case 'avataaars':
            Avataaars(isPlayer1);
            break;
        case 'big-ears':
            BigEars(isPlayer1);
            break;
        case 'dylan':
            Dylan(isPlayer1);
            break;
        case 'lorelei':
            Lorelei(isPlayer1);
            break;
        case 'micah':
            Micah(isPlayer1);
            break;
        case 'personas':
            Personas(isPlayer1);
            break;
        case 'pixel-art':
            PixelArt(isPlayer1);
            break;
    }
}

//==================
//Adventurer Ability
//==================
function Adventurer(isPlayer1)
{
    if (player1Cards.length === 0 || player2Cards.length === 0)
    {
        if (isPlayer1)
            player1AbilityValid = true; //cant forget this lol
        else
            player2AbilityValid = true;

        errorZone.text(`You cannot use your ability with anyone having 0 cards.`);
        errorZone.show(); //show the error message
        errorSound.play();
        return;
    }

    //swaps the decks
    let temp = player1Cards;
    player1Cards = player2Cards;
    player2Cards = temp;

    DisplayCard(true, player1Cards[player1Cards.length - 1]);
    DisplayCard(false, player2Cards[player2Cards.length - 1]);

    if (player1Cards.length !== 1)
        $('#player1NumberOfCards').text(`${player1Cards.length} cards`);
    else
        $('#player1NumberOfCards').text(`${player1Cards.length} card`);

    if (player2Cards.length !== 1)
        $('#player2NumberOfCards').text(`${player2Cards.length} cards`);
    else
        $('#player2NumberOfCards').text(`${player2Cards.length} card`);
}

//=================
//Avataaars Ability
//=================
function Avataaars(isPlayer1)
{
    //removes your last card
    if (isPlayer1)
        RemoveLastCard(true);
    else
        RemoveLastCard(false);
}

//===============
//BigEars Ability
//===============
async function BigEars(isPlayer1)
{
    if (player1Cards.length === 0 || player2Cards.length === 0)
    {
        if (isPlayer1)
            player1AbilityValid = true; //cant forget this lol
        else
            player2AbilityValid = true;

        errorZone.text(`You cannot use your ability with anyone having 0 cards.`);
        errorZone.show(); //show the error message
        errorSound.play();
        return;
    }

    for (let i = 0; i < player1Cards.length; i++)
    {
        DisplayCard(true, player1Cards[i]);

        if (i < player2Cards.length) //just in case they are different sizes
            DisplayCard(false, player2Cards[i]);

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

//=============
//Dylan Ability
//=============
function Dylan(isPlayer1)
{
    let lowestCardIndex = 0;
    let lowestCardValue = 0; //these will always change once

    //drops your lowest card
    if (isPlayer1)
    {
        if (player1Cards.length === 0)
        {
            player1AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with 0 cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        for (let i = 0; i < player1Cards.length; i++)
        {
            let cardCode = player1Cards[i];

            if (lowestCardValue >= GetCardValue(cardCode))
            {
                lowestCardValue = GetCardValue(cardCode);
                lowestCardIndex = i;
            }
        }

        player1Cards.splice(lowestCardIndex, 1);

        if (player1Cards.length !== 1)
            $('#player1NumberOfCards').text(`${player1Cards.length} cards`);
        else
            $('#player1NumberOfCards').text(`${player1Cards.length} card`);
    }
    else
    {
        if (player2Cards.length === 0)
        {
            player2AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with 0 cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        for (let i = 0; i < player2Cards.length; i++)
        {
            let cardCode = player2Cards[i];

            if (lowestCardValue >= GetCardValue(cardCode))
            {
                lowestCardValue = GetCardValue(cardCode);
                lowestCardIndex = i;
            }
        }

        player2Cards.splice(lowestCardIndex, 1);

        if (player2Cards.length !== 1)
            $('#player2NumberOfCards').text(`${player2Cards.length} cards`);
        else
            $('#player2NumberOfCards').text(`${player2Cards.length} card`);
    }
}

//===============
//Lorelei Ability
//===============
function Lorelei(isPlayer1)
{
    //increases value of your card
    if (isPlayer1)
    {
        if(player1Cards.length === 0)
        {
            player1AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with 0 cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        const cardCode = player1Cards[player1Cards.length - 1];
        const cardValue = GetCardValue(cardCode);

        if(cardValue < 14)
        {
            player1Cards[player1Cards.length - 1] = GetCardNumber(cardValue + 1) + cardCode[1];
            DisplayCard(true, player1Cards[player1Cards.length - 1]);
        }
        else
        {
            player1AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with on an ace!`);
            errorZone.show(); //show the error message
            errorSound.play();
        }
    }
    else
    {
        if(player2Cards.length === 0)
        {
            player2AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with 0 cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        const cardCode = player2Cards[player2Cards.length - 1];
        const cardValue = GetCardValue(cardCode);

        if(cardValue < 14)
        {
            player2Cards[player2Cards.length - 1] = GetCardNumber(cardValue + 1) + cardCode[1];
            DisplayCard(false, player2Cards[player2Cards.length - 1]);
        }
        else
        {
            player2AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with on an ace!`);
            errorZone.show(); //show the error message
            errorSound.play();
        }
    }
}

//=============
//Micah Ability
//=============
function Micah(isPlayer1)
{
    //decrease value of other players card
    if (isPlayer1)
    {
        if(player2Cards.length === 0)
        {
            player2AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with them having 0 cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        const cardCode = player2Cards[player2Cards.length - 1];
        const cardValue = GetCardValue(cardCode);

        if(cardValue > 2)
        {
            player2Cards[player2Cards.length - 1] = GetCardNumber(cardValue - 1) + cardCode[1];
            DisplayCard(false, player2Cards[player2Cards.length - 1]);
        }
        else
        {
            player2AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with on a two!`);
            errorZone.show(); //show the error message
            errorSound.play();
        }
    }
    else
    {
        if(player1Cards.length === 0)
        {
            player1AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with them having 0 cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        const cardCode = player1Cards[player1Cards.length - 1];
        const cardValue = GetCardValue(cardCode);

        if(cardValue > 2)
        {
            player1Cards[player1Cards.length - 1] = GetCardNumber(cardValue - 1) + cardCode[1];
            DisplayCard(true, player1Cards[player1Cards.length - 1]);
        }
        else
        {
            player1AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with on a two!`);
            errorZone.show(); //show the error message
            errorSound.play();
        }
    }
}

//=================
//Personas Ability
//=================
function Personas(isPlayer1)
{
    //removes other players last card
    if (isPlayer1)
        RemoveLastCard(false);
    else
        RemoveLastCard(true);
}

//=================
//PixelArt Ability
//=================
function PixelArt(isPlayer1)
{
    //shuffles the other persons cards
    if (isPlayer1)
    {
        DisplayCard(false, player2Cards[player2Cards.length - 1]);
        ShuffleCards(player2Cards);
    }
    else
    {
        DisplayCard(true, player1Cards[player1Cards.length - 1]);
        ShuffleCards(player1Cards);
    }
}

//=============================
//Removes last card from a deck
//=============================
function RemoveLastCard(isPlayer1)
{
    if (isPlayer1)
    {
        if(player1Cards.length === 0)
        {
            player1AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your ability with 0 cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        player1Cards.pop();
        DisplayCard(true, player1Cards[player1Cards.length - 1]);

        if (player1Cards.length !== 1)
            $('#player1NumberOfCards').text(`${player1Cards.length} cards`);
        else
            $('#player1NumberOfCards').text(`${player1Cards.length} card`);
    }
    else
    {
        if(player2Cards.length === 0)
        {
            player2AbilityValid = true; //cant forget this lol

            errorZone.text(`You cannot use your Avataaars ability with 0 cards.`);
            errorZone.show(); //show the error message
            errorSound.play();
            return;
        }

        player2Cards.pop();

        DisplayCard(false, player2Cards[player2Cards.length - 1]);

        if (player2Cards.length !== 1)
            $('#player2NumberOfCards').text(`${player2Cards.length} cards`);
        else
            $('#player2NumberOfCards').text(`${player2Cards.length} card`);
    }
}

//===============
//Shuffles a deck
//===============
function ShuffleCards(deck)
{
    //this shuffles a deck
    for (let i = 0; i < deck.length; i++)
    {
        const j = Math.floor(Math.random() * (deck.length - i)) + i;
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

//=========================================
//Updates the player in the session storage
//=========================================
function UpdatePlayers()
{
    const player1 = JSON.parse(sessionStorage.getItem('player1'));
    const player2 = JSON.parse(sessionStorage.getItem('player2'));

    player1.score = player1Score;
    player2.score = player2Score;

    sessionStorage.setItem('player1', JSON.stringify(player1));
    sessionStorage.setItem('player2', JSON.stringify(player2));
}

//=========================================
//api fetching
async function FetchStats(url){
    try
    {
        const response = await fetch(url);

        if(response.ok){
            return await response.json();
        }
    }
    catch(error)
    {
        console.error("Error:", error);
    }
}