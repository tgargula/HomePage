// Get tiles from ./tiles.json
let tiles;
const httpRequest = new XMLHttpRequest();
httpRequest.open("GET", "js/tiles.json", true);
httpRequest.responseType = "json";
httpRequest.onreadystatechange = function () {
    const done = 4, ok = 200;
    if (httpRequest.readyState === done)
        if (httpRequest.status === ok)
            tiles = httpRequest.response;
        else container.innerHTML = "There is a problem with tiles.json file";
};
httpRequest.send(null);

const searchBar = document.getElementById("search-bar");
const rightArrow = document.getElementById("right-arrow");
const leftArrow = document.getElementById("left-arrow");
const pageCounter = document.getElementById("page-counter");
const container = document.getElementById("container");

const minTileMarginVertically = 10;
const minTileMarginHorizontally = 10;
const extendedTileWidth = 200 + 2 * minTileMarginVertically;
const extendedTileHeight = 250 + 2 * minTileMarginHorizontally;
const letters = /^[A-Za-z]+$/;

let freeSpaceVertically;
let freeSpaceHorizontally;
let tilesInRow;
let rows;
let pages;
let currentPage = 1;

function updateInfo() {
    // Calculate current values
    tilesInRow = Math.floor((window.innerWidth - freeSpaceVertically) / extendedTileWidth);
    rows = Math.max(Math.floor((window.innerHeight - freeSpaceHorizontally) / extendedTileHeight), 0);
    pages = Math.ceil(tiles.length / (tilesInRow * rows));

    // Correct currentPage and pageCounter if necessary
    if (currentPage > pages)
        currentPage = pages;
    if (pages === 1 || pages === Infinity)
        pageCounter.classList.add("invisible");
    else pageCounter.classList.remove("invisible");

    // update pageCounter
    pageCounter.innerHTML = currentPage + " / " + pages;
}

function updateMargins() {
    const end = Math.min(tiles.length, currentPage * rows * tilesInRow);
    for (let index = (currentPage - 1) * rows * tilesInRow; index < end; index++) {
        const tile = document.getElementById("tile" + index);
        tile.style.marginLeft = tile.style.marginRight =
            Math.floor(minTileMarginVertically +
                (window.innerWidth - freeSpaceVertically) % extendedTileWidth / (2 * tilesInRow)) + "px";
        tile.style.marginTop = tile.style.marginBottom =
            Math.floor(minTileMarginHorizontally +
                (window.innerHeight - freeSpaceHorizontally) % extendedTileHeight / (2 * rows)) + "px";
    }
}

function updateArrows() {
    if (currentPage === 1)  // First page
        leftArrow.classList.add("invisible");
    else leftArrow.classList.remove("invisible");
    if (pages !== Infinity)
        if (currentPage === pages)  // Last page
            rightArrow.classList.add("invisible");
        else rightArrow.classList.remove("invisible");
    else {  // Make arrows invisible if there are no tiles
        leftArrow.classList.add("invisible");
        rightArrow.classList.add("invisible");
    }
}

function addTiles() {
    const end = Math.min(tiles.length, currentPage * rows * tilesInRow);
    for (let index = (currentPage - 1) * rows * tilesInRow; index < end; index++) {
        // Create div
        const div = document.createElement("div");
        div.setAttribute("class", "tile");
        div.setAttribute("id", "tile" + index);

        // Create link
        const a = document.createElement("a");
        a.setAttribute("class", "link");
        a.setAttribute("href", tiles[index].href);

        // Create image
        const img = document.createElement("img");
        img.setAttribute("class", "image");
        img.setAttribute("src", "images/" + tiles[index].src);
        img.setAttribute("alt", "");

        // Create tile name
        const p = document.createElement("p");
        p.setAttribute("class", "name");
        p.innerHTML = tiles[index].name;

        // Join all elements and add to the container
        a.appendChild(img);
        a.appendChild(p);
        div.appendChild(a);
        container.appendChild(div);
    }
}

function removeTiles() {
    const tilesToRemove = container.childNodes;
    while (tilesToRemove.length > 0)
        container.removeChild(tilesToRemove[0]);
}

function update() {
    updateInfo();
    updateArrows();
    removeTiles();
    addTiles();
    updateMargins();
}

function moveRight() {
    if (currentPage < pages) {
        currentPage++;
        update();
    }
}

function moveLeft() {
    if (currentPage > 1) {
        currentPage--;
        update();
    }
}

window.onload = function () {
    // INIT
    freeSpaceVertically = document.getElementById("left-margin").offsetWidth +
        document.getElementById("right-margin").offsetWidth;
    freeSpaceHorizontally = document.getElementById("header").offsetHeight +
        document.getElementById("footer").offsetHeight;
    httpRequest.onload = update;

    // Change layout on resize
    window.onresize = function () {
        const tmp = rows * tilesInRow;
        updateInfo();
        updateArrows();

        // Update layout if necessary
        if (tmp !== rows * tilesInRow) {
            removeTiles();
            addTiles();
        }

        updateMargins();
    }

    rightArrow.onclick = moveRight;
    leftArrow.onclick = moveLeft;

    window.onkeydown = function (e) {
        if (document.activeElement === searchBar) {
            switch (e.key) {
                case "ArrowDown":
                case "Escape":
                    searchBar.blur();
                    break;
                case "Enter":
                    window.location = "https://www.google.com/search?q=" + searchBar.value;
                    break;
            }
        } else {
            switch (e.key) {
                case "ArrowRight":
                    moveRight();
                    break;
                case "ArrowLeft":
                    moveLeft();
                    break;
                case "Home":
                    currentPage = 1;
                    break;
                case "Enter":
                case "ArrowDown":
                    e.preventDefault();
                    break;
                case "End":
                    currentPage = pages;
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    searchBar.focus();
                    break;
                default:
                    if (e.key.match(letters))
                        searchBar.focus();
                    else {
                        const key = parseInt(e.key);
                        if (!isNaN(key)) {
                            if (key <= pages && key > 0)
                                currentPage = key;
                        }
                    }
            }
            update();
        }
    }
}