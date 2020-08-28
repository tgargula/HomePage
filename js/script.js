// Get tiles from ./tiles.json
let tiles;
const request = new XMLHttpRequest();
request.open("GET", "js/tiles.json", true);
request.responseType = "json";
request.onreadystatechange = function () {
    const done = 4, ok = 200;
    if (request.readyState === done)
        if (request.status === ok)
            tiles = request.response;
        else container.innerHTML = "There is a problem with tiles.json file";
};
request.send(null);

const searchBar = document.getElementById("search-bar");
const rightArrow = document.getElementById("right-arrow");
const leftArrow = document.getElementById("left-arrow");
const pageCounter = document.getElementById("page-counter");
const container = document.getElementById("container");

const minTileMarginVertically = 10;
const minTileMarginHorizontally = 10;
const freeSpaceVertically = 400;
const freeSpaceHorizontally = 200;
const extendedTileWidth = 200 + 2 * minTileMarginVertically;
const extendedTileHeight = 250 + 2 * minTileMarginHorizontally;

class DefaultContainer {
    rows;
    tilesInRow;
    pages;

    constructor() {
        this.currentPage = 1;
    }

    updateInfo() {
        // Calculate current values
        this.tilesInRow = Math.floor((window.innerWidth - freeSpaceVertically) / extendedTileWidth);
        this.rows = Math.max(Math.floor((window.innerHeight - freeSpaceHorizontally) / extendedTileHeight), 0);
        this.pages = Math.ceil(tiles.length / (this.tilesInRow * this.rows));

        // Correct currentPage and pageCounter if necessary
        if (this.currentPage > this.pages)
            this.currentPage = this.pages;
        if (this.pages === 1 || this.pages === Infinity)
            pageCounter.classList.add("invisible");
        else pageCounter.classList.remove("invisible");

        // update pageCounter
        pageCounter.innerHTML = this.currentPage + " / " + this.pages;
    }

    updateMargins() {
        for (const tile of container.getElementsByClassName("tile")) {
            tile.style.marginLeft = tile.style.marginRight =
                Math.floor(minTileMarginVertically +
                    (window.innerWidth - freeSpaceVertically) % extendedTileWidth / (2 * this.tilesInRow)) + "px";
            tile.style.marginTop = tile.style.marginBottom =
                Math.floor(minTileMarginHorizontally +
                    (window.innerHeight - freeSpaceHorizontally) % extendedTileHeight / (2 * this.rows)) + "px";
        }
    }

    updateArrows() {
        if (this.currentPage === 1)  // First page
            leftArrow.classList.add("invisible");
        else leftArrow.classList.remove("invisible");
        if (this.currentPage === this.pages)  // Last page
            rightArrow.classList.add("invisible");
        else rightArrow.classList.remove("invisible");
        if (this.pages === Infinity) { // Make arrows invisible iff there are no tiles
            leftArrow.classList.add("invisible");
            rightArrow.classList.add("invisible");
        }
    }

    addTiles() {
        const end = Math.min(tiles.length, this.currentPage * this.rows * this.tilesInRow);
        for (let index = (this.currentPage - 1) * this.rows * this.tilesInRow; index < end; index++) {
            // Create div
            const div = document.createElement("div");
            div.setAttribute("class", "tile");

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

    removeTiles() {
        while (container.firstChild)
            container.removeChild(container.lastChild);
    }

    update() {
        this.updateInfo();
        this.updateArrows();
        this.removeTiles();
        this.addTiles();
        this.updateMargins();
    }

    moveRight() {
        if (this.currentPage < this.pages) {
            this.currentPage++;
            this.update();
        }
    }

    moveLeft() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.update();
        }
    }
}

window.onload = function () {
    // INIT
    let defaultContainer = new DefaultContainer();
    request.onload = function () { defaultContainer.update(); };
    rightArrow.addEventListener("click", function () { defaultContainer.moveRight(); });
    leftArrow.addEventListener("click", function() { defaultContainer.moveLeft(); });

    // Change layout on resize
    window.addEventListener("resize", function () {
        const tmp = defaultContainer.rows * defaultContainer.tilesInRow;
        defaultContainer.updateInfo();
        defaultContainer.updateArrows();

        // Update layout if necessary
        if (tmp !== defaultContainer.rows * defaultContainer.tilesInRow) {
            defaultContainer.removeTiles();
            defaultContainer.addTiles();
        }

        defaultContainer.updateMargins();
    });

    window.addEventListener("keydown", function (e) {
        const letters = /^[A-Za-z]+$/;
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
                    defaultContainer.moveRight();
                    break;
                case "ArrowLeft":
                    defaultContainer.moveLeft();
                    break;
                case "Home":
                    defaultContainer.currentPage = 1;
                    defaultContainer.update();
                    break;
                case "End":
                    defaultContainer.currentPage = defaultContainer.pages;
                    defaultContainer.update();
                    break;
                case "Enter":
                case "ArrowDown":
                    e.preventDefault();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    searchBar.focus();
                    break;
                default:
                    if (e.key.match(letters) && e.key.length === 1)   // if letter
                        searchBar.focus();
                    else {
                        const key = parseInt(e.key);
                        if (!isNaN(key)) {      // if number
                            if (key <= defaultContainer.pages && key > 0) {
                                defaultContainer.currentPage = key;
                                defaultContainer.update();
                            }
                        }
                    }
            }
        }
    });
};