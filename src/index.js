require('./index.css');
require('./filter.js');
require('./dragNdrop.js');

var friendsLeft = document.querySelector('#friends-left');
var friendsRight = document.querySelector('#friends-right');
var loadFriends = document.querySelector('#loadFriends');
var globalContainer = document.querySelector('#globalContainer');
var closeGlobalContainer = document.querySelector('#closeGlobalContainer');
var saveButtom = document.querySelector('#save');
var friendsList = { left: [], right: [] };


saveButtom.addEventListener('click', handleSaveToLocalStorage);

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

function createFriendsDivLeft(friends) {
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

closeGlobalContainer.addEventListener('click', () => {
    globalContainer.style.display = "none";
    loadFriends.style.display = "block";
});

loadFriends.addEventListener('click', () => {
    if (friendsList.left.length > 0 || friendsList.right.length > 0) {
        loadFriends.style.display = "none";
        globalContainer.style.display = "block";
        return;
    }

    if (localStorage.left || localStorage.right) {
        loadFriends.style.display = "none";
        globalContainer.style.display = "block";
        friendsList.left = JSON.parse(localStorage.left);
        friendsList.right = JSON.parse(localStorage.right);
        friendsLeft.innerHTML = createFriendsDivLeft(friendsList.left);
        friendsRight.innerHTML = createFriendsDivRight(friendsList.right);
        return;
    }

    login()
        .then(() => callAPI('friends.get', { v: 5.62, fields: ['city', 'country', 'photo_100'] }))
        .then(result => {
            friendsList.left = result.items;
            friendsLeft.innerHTML = createFriendsDivLeft(result.items);
        })
        .then(() => {
            loadFriends.style.display = "none";
            globalContainer.style.display = "block";
        })
        .catch(() => alert('Не получилось загрузить список друзей'));
});

friendsLeft.addEventListener('click', (e) => {
    if (!e.target.dataset.side) {
        return;
    }

    for (let i = 0; i < friendsList.left.length; i++) {
        if (friendsList.left[i].id == e.target.dataset.id) {
            friendsList.right.push(friendsList.left[i]);
            friendsList.left.splice(i, 1);
            break;
        }
    }

    friendsRight.innerHTML = createFriendsDivRight(friendsList.right);
    friendsLeft.innerHTML = createFriendsDivLeft(friendsList.left);
});

friendsRight.addEventListener('click', (e) => {
    if (!e.target.dataset.side) {
        return;
    }

    for (let i = 0; i < friendsList.right.length; i++) {
        if (friendsList.right[i].id == e.target.dataset.id) {
            friendsList.left.push(friendsList.right[i]);
            friendsList.right.splice(i, 1);
            break;
        }
    }

    friendsRight.innerHTML = createFriendsDivRight(friendsList.right);
    friendsLeft.innerHTML = createFriendsDivLeft(friendsList.left);
});