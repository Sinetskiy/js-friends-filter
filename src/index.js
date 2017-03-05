require('./index.css');

function login() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 5908777
        });
        VK.Auth.login(function(result) {
            if (result.status == 'connected') {
                resolve();
            } else {
                reject();
            }
        });
    });
}

function callAPI(method, params) {
    return new Promise((resolve, reject) => {
        VK.api(method, params, function(result) {
            if (result.error) {
                reject();
            } else {
                resolve(result.response);
            }
        });
    });
}

function createFriendsDiv(friends) {
    var templateFn = require('../friend-template.hbs');

    return templateFn({
        friends: friends
    });
}

function createFriendsDivRight(friends) {
    var templateFn = require('../friend-template.right.hbs');

    return templateFn({
        friends: friends
    });
}

var friends = document.querySelector('#friends');
var friendsInList = document.querySelector('#friendsInList');
var loadFriends = document.querySelector('#loadFriends');
var friendsList = [];
var friendsListRight = [];

loadFriends.addEventListener('click', () => {
    login()
        .then(() => callAPI('friends.get', { v: 5.62, fields: ['city', 'country', 'photo_100'] }))
        .then(result => {
            friendsList = result.items;
            friends.innerHTML = createFriendsDiv(result.items);
        })
        .then(() => loadFriends.parentNode.removeChild(loadFriends))
        .catch(() => alert('всё плохо'));
});

friends.addEventListener('click', (e) => {
    if (!e.target.dataset.side) {
        return;
    }

    for (let i = 0; i < friendsList.length; i++) {
        if (friendsList[i].id == e.target.dataset.id) {
            friendsListRight.push(friendsList[i]);
            friendsList.splice(i, 1);
            break;
        }
    }

    friendsInList.innerHTML = createFriendsDivRight(friendsListRight);
    friends.innerHTML = createFriendsDiv(friendsList);
});

friendsInList.addEventListener('click', (e) => {
    if (!e.target.dataset.side) {
        return;
    }

    for (let i = 0; i < friendsListRight.length; i++) {
        if (friendsListRight[i].id == e.target.dataset.id) {
            friendsList.push(friendsListRight[i]);
            friendsListRight.splice(i, 1);
            break;
        }
    }

    friendsInList.innerHTML = createFriendsDivRight(friendsListRight);
    friends.innerHTML = createFriendsDiv(friendsList);
});