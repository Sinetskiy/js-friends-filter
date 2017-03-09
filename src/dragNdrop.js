var dragElementId = null;

friendsLeft.addEventListener('dragstart', handleDragStart);
friendsLeft.addEventListener('dragover', handleDragOver);
friendsLeft.addEventListener('drop', handleDrop);
friendsLeft.addEventListener('dragend', handleDragEnd);
friendsRight.addEventListener('dragstart', handleDragStart);
friendsRight.addEventListener('dragover', handleDragOver);
friendsRight.addEventListener('drop', handleDrop);
friendsRight.addEventListener('dragend', handleDragEnd);

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

    friendsRight.innerHTML = createFriendsDivRight(friendsList.right);
    friendsLeft.innerHTML = createFriendsDivLeft(friendsList.left);

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