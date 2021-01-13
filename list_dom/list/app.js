const data = [{
  'folder': true,
  'title': 'Pictures',
  'children': [{
      'title': 'logo.png'
    },
    {
      'folder': true,
      'title': 'Vacations',
      'children': [{
        'title': 'spain.jpeg'
      }]
    }
  ]
},
{
  'folder': true,
  'title': 'Desktop',
  'children': [{
    'folder': true,
    'title': 'screenshots',
    'children': null
  }]
},
{
  'folder': true,
  'title': 'Downloads',
  'children': [{
      'folder': true,
      'title': 'JS',
      'children': null
    },
    {
      'title': 'nvm-setup.exe'
    },
    {
      'title': 'node.exe'
    }
  ]
},
{
  'title': 'credentials.txt'
}
];

const rootNode = document.getElementById('root');
const ENTER_KEY_CODE = 13;
let menuBox = null;
let isMenuDisplayed = false;
let isRenameMode = false;
let menuActionTarget = null;
let inputField = null;
const CONTEXT_MENU_ITEMS = [{
text: 'Rename',
action: renameItem
}, {
text: 'Delete item',
action: deleteItem
}];

function deleteItem() {
let nodeToDelete = menuActionTarget.parentNode;
let parentToCheck = nodeToDelete.parentNode;

nodeToDelete.remove();

if (!parentToCheck.hasChildNodes()) {
  createEmptyItem(parentToCheck);
}

menuActionTarget = null;
contextMenuHide();
}

function renameItem() {
isRenameMode = true;
contextMenuHide();
menuActionTarget.setAttribute('contenteditable', 'true');
menuActionTarget.focus();

let end = 0;

const selection = window.getSelection();
const range = document.createRange();
const textToEdit = menuActionTarget.firstChild;

if (textToEdit.nodeValue.indexOf('.') > 0) {
  end = textToEdit.nodeValue.indexOf('.');
} else {
  end = textToEdit.nodeValue.length;
}

range.setStart(textToEdit, 0);
range.setEnd(textToEdit, end);
selection.removeAllRanges();
selection.addRange(range)

menuActionTarget.addEventListener('keydown', (event) => {
  if (event.keyCode === ENTER_KEY_CODE) {
    disableRenameMode(event, menuActionTarget);
  }
})
}

function createListElement(root) {
let listElement = document.createElement('ul');
root.appendChild(listElement);
return listElement;
}

function createListItem(root, title, isFolder) {
let listItem = document.createElement('li');
let spanItem = document.createElement('span');
spanItem.innerText += title;
listItem.appendChild(spanItem);

if (isFolder) {
  spanItem.classList.add('folder');
  spanItem.classList.add('collapsed');
  spanItem.addEventListener('click', (event) => folderStateToggle(event));
} else {
  spanItem.classList.add('file');
}

spanItem.addEventListener('click', (event) => removeStaticHighlihght(event, menuActionTarget));
spanItem.addEventListener('contextmenu', (event) => removeStaticHighlihght(event, menuActionTarget));
spanItem.addEventListener('blur', disableRenameMode);
spanItem.addEventListener('contextmenu', contextMenuShow);
addHoverEffect(spanItem);
root.appendChild(listItem);
return listItem;
}

function createEmptyItem(root) {
let emptyList = createListElement(root);
emptyList.classList.add('empty');
let emptyItem = document.createElement('li');
emptyItem.innerText += 'Folder is empty';
emptyList.appendChild(emptyItem);
}

function addHoverEffect(item) {
item.addEventListener('mouseenter', (event) => {
  if (!isMenuDisplayed && !isRenameMode) {
    event.target.classList.add('highlighted');
    event.stopPropagation();
  }
})

item.addEventListener('mouseout', (event) => {
  if (!isMenuDisplayed && !isRenameMode) {
    event.target.classList.remove('highlighted');
    event.stopPropagation();
  }
})
}

function folderStateToggle(event) {
if (event.target.matches('span.folder')) {
  event.target.classList.toggle('collapsed');
}
}

function removeStaticHighlihght(event, previousActionTarget) {
if (previousActionTarget && previousActionTarget.classList.contains('highlighted')) {
  previousActionTarget.classList.remove('highlighted');
}
event.target.classList.add('highlighted');
}

function createContextMenu(items) {
const body = document.querySelector('body');
let contextMenu = document.createElement('div');
contextMenu.className = 'menu';
for (let item of items) {
  let menuItem = document.createElement('div');
  menuItem.innerText += item.text;
  menuItem.className = 'menu-item';
  menuItem.addEventListener('click', item.action)
  contextMenu.appendChild(menuItem);
}
body.appendChild(contextMenu);
}

function contextMenuShow(event) {
const PADDING = 5;
let left = event.clientX;
let top = event.clientY;
menuBox = document.querySelector('.menu');
menuBox.style.left = left + PADDING + 'px';
menuBox.style.top = top - PADDING + 'px';
menuBox.style.display = 'block';
event.target.focus();
event.preventDefault();
isMenuDisplayed = true;
menuActionTarget = event.target;

if (!menuActionTarget.matches('span.folder') && !menuActionTarget.matches('span.file')) {
  menuBox.style.pointerEvents = 'none';
} else {
  menuBox.style.pointerEvents = 'auto';
}
}

function contextMenuHide() {
if (isMenuDisplayed) {
  menuBox.style.display = 'none';
  isMenuDisplayed = false;
  if (menuActionTarget && !isRenameMode){
    menuActionTarget.classList.remove('highlighted');
  }
}
}

function disableRenameMode(event) {
if (isRenameMode && !event.target.matches('div.menu-item')) {
  isRenameMode = false;
  menuActionTarget.removeAttribute('contenteditable');
  menuActionTarget.classList.remove('highlighted');
}
}

function buildHTMLTree(tree, root) {
let list = createListElement(root);
for (let node of tree) {
  let isEmptyFolder = node.folder && !node.children;
  let item = createListItem(list, node.title, node.folder);

  if (node.children) {
    buildHTMLTree(node.children, item);
  } else {
    if (isEmptyFolder) {
      createEmptyItem(item);
    }
  }
}
}

createContextMenu(CONTEXT_MENU_ITEMS);
buildHTMLTree(data, rootNode);

window.addEventListener('click', contextMenuHide);
window.addEventListener('click', disableRenameMode);
rootNode.addEventListener('contextmenu', contextMenuShow);