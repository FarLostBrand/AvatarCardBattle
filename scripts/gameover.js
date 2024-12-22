DisplayWinner();

//=========================================
//event handlers

//=================
//Play again button
//=================
$('#playAgain').on('click', () => {
    window.location.href = './character-selection.html';
})

//=========================================
//functions

//====================
//Displays the winner
//====================
function DisplayWinner()
{
    //get players
    const player1 = JSON.parse(sessionStorage.getItem('player1'));
    const player2 = JSON.parse(sessionStorage.getItem('player2'));

    if (player1.score > player2.score)
    {
        const player1Avatar = JSON.parse(sessionStorage.getItem('player1Avatar'));

        $('#whoWins').text(`${player1.name} wins!`);

        const player1AvatarDisplay = $('#winnerAvatar');
        player1AvatarDisplay.html(`<img class="avatarImg" loading="lazy" src="https://api.dicebear.com/9.x/${player1Avatar.style}/svg?seed=${player1Avatar.id}&backgroundColor=${player1Avatar.color}"/>`)
    }
    else if (player1.score < player2.score)
    {
        const player2Avatar = JSON.parse(sessionStorage.getItem('player2Avatar'));

        $('#whoWins').text(`${player2.name} wins!`);

        const player2AvatarDisplay = $('#winnerAvatar');
        player2AvatarDisplay.html(`<img class="avatarImg" loading="lazy" src="https://api.dicebear.com/9.x/${player2Avatar.style}/svg?seed=${player2Avatar.id}&backgroundColor=${player2Avatar.color}"/>`)
    }
    else
    {
        $('#playerSection').hide(); //because it's a tie
    }
}

