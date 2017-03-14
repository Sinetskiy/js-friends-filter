var friendsLeft = document.querySelector('#friends-left');
var friendsRight = document.querySelector('#friends-right');
var loadFriends = document.querySelector('#loadFriends');
var globalContainer = document.querySelector('#globalContainer');
var closeGlobalContainer = document.querySelector('#closeGlobalContainer');
var saveButton = document.querySelector('#save');
var friendsFilterLeft = document.querySelector('#friendsFilterLeft');
var friendsFilterRight = document.querySelector('#friendsFilterRight');
var friendsList = { left: [], right: [] };
var dragElementId = null;
var filterValue = '';

friendsLeft.addEventListener('dragstart', handleDragStart);
friendsLeft.addEventListener('dragover', handleDragOver);
friendsLeft.addEventListener('drop', handleDrop);
friendsLeft.addEventListener('dragend', handleDragEnd);
friendsRight.addEventListener('dragstart', handleDragStart);
friendsRight.addEventListener('dragover', handleDragOver);
friendsRight.addEventListener('drop', handleDrop);
friendsRight.addEventListener('dragend', handleDragEnd);
friendsFilterLeft.addEventListener('keyup', friendsFilterHandler);
friendsFilterRight.addEventListener('keyup', friendsFilterHandler);
saveButton.addEventListener('click', handleSaveToLocalStorage);

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
        friendsLeft.innerHTML = createFriendsDiv(friendsList.left, friendsLeft.id);
        friendsRight.innerHTML = createFriendsDiv(friendsList.right, friendsRight.id);
        return;
    }

    login()
        .then(() => callAPI('friends.get', { v: 5.62, fields: ['city', 'country', 'photo_100'] }))
        .then(result => {
            friendsList.left = result.items;
            friendsLeft.innerHTML = createFriendsDiv(result.items, friendsLeft.id);
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

    SetColumnData(friendsLeft, friendsList.left, friendsFilterLeft);
    SetColumnData(friendsRight, friendsList.right, friendsFilterRight);
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

    SetColumnData(friendsLeft, friendsList.left, friendsFilterLeft);
    SetColumnData(friendsRight, friendsList.right, friendsFilterRight);

});

function friendsFilterHandler(e) {
    filterValue = this.value.trim();

    if (e.target.id == 'friendsFilterLeft') {
        SetColumnData(friendsLeft, friendsList.left, friendsFilterLeft);
    }

    if (e.target.id == 'friendsFilterRight') {
        SetColumnData(friendsRight, friendsList.right, friendsFilterRight);
    }
}

function handleDragStart(e) {
    if (isAttributeExist(e.target, 'draggable')) {
        e.target.style.opacity = '0.4';
        dragElementId = e.target.dataset.id;
    }
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    return false;
}

function handleDrop(e) {

    if (e.stopPropagation) {
        e.stopPropagation();
    }

    var elementPositionLeft = GetPosition(friendsList.left, dragElementId);
    var elementPositionRight = GetPosition(friendsList.right, dragElementId);

    if (elementPositionLeft > -1) {
        friendsList.right.push(friendsList.left[elementPositionLeft]);
        friendsList.left.splice(elementPositionLeft, 1);
    }

    if (elementPositionRight > -1) {
        friendsList.left.push(friendsList.right[elementPositionRight]);
        friendsList.right.splice(elementPositionRight, 1);
    }

    SetColumnData(friendsLeft, friendsList.left, friendsFilterLeft);
    SetColumnData(friendsRight, friendsList.right, friendsFilterRight);

    return false;
}

function handleDragEnd(e) {
    if (e.target.attributes.length > 1 && e.target.attributes[1].name == 'draggable') {
        e.target.style.opacity = '1';
    }
}

function handleSaveToLocalStorage(e) {
    localStorage.left = JSON.stringify(friendsList.left);
    localStorage.right = JSON.stringify(friendsList.right);
}


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

function createFriendsDiv(friends, columnId) {
    let templateFn;

    if (columnId == "friends-left") {
        templateFn = require('../friend-template.left.hbs');
    }

    if (columnId == "friends-right") {
        templateFn = require('../friend-template.right.hbs');
    }

    return templateFn({
        friends: friends
    });
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

function friendsMatch(f) {
    return isMatching(f.first_name, filterValue) ||
        isMatching(f.last_name, filterValue) ||
        isMatching(`${f.first_name} ${f.last_name}`, filterValue);
}


function isAttributeExist(node, attributeName) {
    for (let attribute of node.attributes) {
        if (attributeName == attribute.name) {
            return true;
        }
    }

    return false;
}

function GetPosition(frinendsArray, elementId) {
    for (let i = 0; i < frinendsArray.length; i++) {
        if (elementId == frinendsArray[i].id) {
            return i;
        }
    }
    return -1;
}

function SetColumnData(friendsColumn, columnData, filterFild) {
    filterValue = '';
    filterValue = filterFild.value.trim();
    if (filterValue != '') {
        friendsColumn.innerHTML = createFriendsDiv(columnData.filter(friendsMatch), friendsColumn.id);
    } else {
        friendsColumn.innerHTML = createFriendsDiv(columnData, friendsColumn.id);
    }
}