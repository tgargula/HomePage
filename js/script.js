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
const smallContainer = document.getElementById("small-container");

const minTileMarginVertically = 10;
const minTileMarginHorizontally = 10;
const freeSpaceVertically = 400;
const freeSpaceHorizontally = 200;
const extendedTileWidth = 200 + 2 * minTileMarginVertically;
const extendedTileHeight = 250 + 2 * minTileMarginHorizontally;

class Container {
    constructor(container) {
        this.container = container;
    }

    addTile(tile) {
        // Create div
        const div = document.createElement("div");
        div.setAttribute("class", "tile");

        // Create link
        const a = document.createElement("a");
        a.setAttribute("class", "link");
        a.setAttribute("href", tile.href);

        // Create image
        const img = document.createElement("img");
        img.setAttribute("class", "image");
        img.setAttribute("src", "images/" + tile.src);
        img.setAttribute("alt", "");

        // Create tile name
        const p = document.createElement("p");
        p.setAttribute("class", "name");
        p.innerHTML = tile.name;

        // Join all elements and add to the container
        a.appendChild(img);
        a.appendChild(p);
        div.appendChild(a);
        this.container.appendChild(div);
    }

    removeTiles() {
        while (this.container.firstChild)
            this.container.removeChild(this.container.lastChild);
    }
}

class DefaultContainer extends Container {
    rows;
    tilesInRow;
    pages;
    currentPage = 1;

    constructor(container) {
        super(container);
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
        for (const tile of container.childNodes) {
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
        for (let index = (this.currentPage - 1) * this.rows * this.tilesInRow; index < end; index++)
            this.addTile(tiles[index]);
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

    makeVisible() {
        this.container.classList.remove("invisible");
        smallContainer.classList.add("invisible");
        pageCounter.classList.remove("invisible");
        this.updateArrows();
    }
}

class SearchContainer extends Container {
    selectedTile;

    constructor(smallContainer) {
        super(smallContainer);
    }

    addMatchingTiles(input) {
        const maxTilesInRow = Math.min(Math.floor((window.innerWidth - freeSpaceVertically) / 280), 4);
        for (let tile of tiles) {
            // Display all tiles that begin with input
            if (tile.name.toLowerCase().match(new RegExp("^" + input.toLowerCase()))) this.addTile(tile);
            if (smallContainer.childNodes.length === maxTilesInRow) break;
        }
        for (let tile of tiles) {
            // Then display all left tiles that match
            if (tile.name.toLowerCase().match(new RegExp("^(?!" + input.toLowerCase() + ").*")) &&
                tile.name.toLowerCase().match(input.toLowerCase())) this.addTile(tile);
            if (smallContainer.childNodes.length === maxTilesInRow) break;
        }
        this.selectedTile = smallContainer.firstChild;
        this.selectedTile.classList.add("selected");
    }

    updateMargins() {
        let howManyTiles = smallContainer.childNodes.length;
        for (const tile of smallContainer.childNodes)
            tile.style.marginLeft = tile.style.marginRight = "40px";
        this.selectedTile.style.marginLeft =
            Math.floor(((window.innerWidth - freeSpaceVertically - (howManyTiles - 1) * 280) - 200) / 2) + "px";
    }

    update(input) {
        this.removeTiles();
        this.addMatchingTiles(input);
        this.updateMargins();
    }

    useSelectedTile() {
        window.location = this.selectedTile.firstChild;
    }

    selectRight() {
        const array = this.container.childNodes;
        for (let index = 0; index < array.length - 1; index++) {
            if (this.selectedTile === array[index]) {
                this.selectedTile.classList.remove("selected");
                this.selectedTile = array[index + 1];
                this.selectedTile.classList.add("selected");
                break;
            }
        }
    }

    selectLeft() {
        const array = this.container.childNodes;
        for (let index = 1; index < array.length; index++) {
            if (this.selectedTile === array[index]) {
                this.selectedTile.classList.remove("selected");
                this.selectedTile = array[index - 1];
                this.selectedTile.classList.add("selected");
                break;
            }
        }
    }

    makeVisible() {
        this.container.classList.remove("invisible");
        container.classList.add("invisible");
        pageCounter.classList.add("invisible");
        leftArrow.classList.add("invisible");
        rightArrow.classList.add("invisible");
    }
}

const defaultContainer = new DefaultContainer(container);
const searchContainer = new SearchContainer(smallContainer);

window.onload = function () {
    // INIT
    searchBar.value = "";
    request.onload = function () {
        defaultContainer.update();
    };

    rightArrow.addEventListener("click", function () {
        defaultContainer.moveRight();
    });

    leftArrow.addEventListener("click", function () {
        defaultContainer.moveLeft();
    });

    // Change layout on resize
    window.addEventListener("resize", function () {
        if (smallContainer.classList.contains("invisible")) {
            const tmp = defaultContainer.rows * defaultContainer.tilesInRow;
            defaultContainer.updateInfo();
            defaultContainer.updateArrows();

            // Update layout if necessary
            if (tmp !== defaultContainer.rows * defaultContainer.tilesInRow) {
                defaultContainer.removeTiles();
                defaultContainer.addTiles();
            }

            defaultContainer.updateMargins();
        } else {
            searchContainer.update(searchBar.value);
        }
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
                    if (smallContainer.getElementsByClassName("tile").length === 0)
                        window.location = "https://www.google.com/search?q=" + searchBar.value;
                    else searchContainer.useSelectedTile();
                    break;
                case "Backspace":
                    if (searchBar.value.length === 1) defaultContainer.makeVisible();
                    else searchContainer.update(searchBar.value.slice(0, -1));
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    searchContainer.selectRight();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    searchContainer.selectLeft();
                    break;
            }
            if (e.key.match(letters) && e.key.length === 1) {
                searchContainer.makeVisible();
                searchContainer.update(searchBar.value + e.key);
            }
        } else {
            switch (e.key) {
                case "ArrowRight":
                    if (container.classList.contains("invisible")) searchContainer.selectRight();
                    else defaultContainer.moveRight();
                    break;
                case "ArrowLeft":
                    if (container.classList.contains("invisible")) searchContainer.selectLeft();
                    else defaultContainer.moveLeft();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    searchBar.focus();
                    break;
                case "Backspace":
                    searchBar.focus();
                    break;
                case "Enter":
                    if (container.classList.contains("invisible")) searchContainer.useSelectedTile();
                    else e.preventDefault();
                    break;
                default:
                    if (e.key.match(letters) && e.key.length === 1) { // if letter
                        searchBar.focus();
                        searchContainer.makeVisible();
                        searchContainer.update(searchBar.value + e.key);
                    } else {
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