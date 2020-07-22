class Tile {
    constructor(name, src, href) {
        this.name = name;
        this.src = src;
        this.href = href;
    }
}

const tiles = [
    new Tile("Google", "images/google.png", "https://google.com"),
    new Tile("Messenger", "images/messenger.png", "https://messenger.com"),
    new Tile("Facebook", "images/facebook.png", "https://www.facebook.com/"),
    new Tile("Youtube", "images/youtube.png", "https://www.youtube.com/"),
    new Tile("Gmail", "images/gmail.png", "https://mail.google.com/mail/u/0/"),
    new Tile("Dysk Google", "images/google-drive.png", "https://drive.google.com/drive/my-drive"),
    new Tile("Office", "images/office.png", "https://www.office.com/"),
    new Tile("Forum", "images/forum.png", "https://forum.iiet.pl/index.php?sid=15d012bb3093dc91dacad37033a5d4f0"),
    new Tile("Upel", "images/upel.png", "https://upel2.cel.agh.edu.pl/wiet/"),
    new Tile("Wiki", "images/wiki-iiet.png", "https://wiki.iiet.pl/doku.php"),
    new Tile("USOS", "images/usos.png", "https://web.usos.agh.edu.pl/kontroler.php?_action=dla_stud/studia/oceny/index"),
    new Tile("Poczta AGH", "images/mail.png", "https://poczta.agh.edu.pl/rcm-1.3.8/"),
    new Tile("Bank Millennium", "images/millennium.png", "https://www.bankmillennium.pl/"),
    new Tile("Github", "images/github.png", "https://github.com/tgargula/AGH"),
    new Tile("Udemy", "images/udemy.png", "https://www.udemy.com/"),
    new Tile("Enroll", "images/enroll.png", "https://enroll-me.iiet.pl/enrollme-iet/app/enrollment?execution=e6s1")
]

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
        img.setAttribute("src", tiles[index].src);
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

    update();

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