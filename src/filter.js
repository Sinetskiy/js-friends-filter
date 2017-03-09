var friendsFilterLeft = document.querySelector('#friendsFilterLeft');
var friendsFilterRight = document.querySelector('#friendsFilterRight');

friendsFilterLeft.addEventListener('keyup', friendsFilterHandler);
friendsFilterRight.addEventListener('keyup', friendsFilterHandler);

function friendsFilterHandler(e) {
    let value = this.value.trim();

    if (value == '') {
        friendsLeft.innerHTML = createFriendsDivLeft(friendsList.left);
        friendsRight.innerHTML = createFriendsDivRight(friendsList.right);
        return;
    }

    let handler = function(f) {
        return isMatching(f.first_name, value) ||
            isMatching(f.last_name, value) ||
            isMatching(`${f.first_name} ${f.last_name}`, value);
    }

    if (e.target.id == 'friendsFilterLeft') {
        friendsLeft.innerHTML = createFriendsDivLeft(friendsList.left.filter(handler));
    }

    if (e.target.id == 'friendsFilterRight') {
        friendsRight.innerHTML = createFriendsDivRight(friendsList.right.filter(handler));
    }
}

function isMatching(full, chunk) {

    if (typeof full != 'string') {
        throw new Error('"full" is not a string type');
    }

    if (typeof chunk != 'string') {
        throw new Error('"chunk" is not a string type');
    }

    return full.toUpperCase().includes(chunk.toUpperCase());
}