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

const searchEngines = [
    {
        src: 'google-text.png',
        href: 'https://www.google.com/search?q='
    },
    {
        src: 'youtube-text.png',
        href: 'https://www.youtube.com/results?search_query='
    }
]

String.prototype.isSign = function () {
    return !!this.match(/^(\S|\s)$/)
}

HTMLElement.prototype.display = function () {
    this.classList.remove("invisible");
}

HTMLElement.prototype.hide = function () {
    this.classList.add("invisible");
}

searchBar.willBeClear = function (key) {
    return (this.selectionStart === 0 && this.selectionEnd === this.value.length)
        || (this.selectionStart === 1 && this.value.length === 1 && key === "Backspace")
        || (this.selectionStart === 0 && this.value.length === 1 && key === "Delete");
}

searchBar.removeLetters = function (key) {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    let input;

    this.focus();

    if (this.willBeClear(key)) {
        defaultContainer.display();
        return;
    }
    else if (start !== end)
        input = this.value.slice(0, start) + this.value.slice(end);
    else if (key === "Backspace")
        input = this.value.slice(0, start - 1) + this.value.slice(end);
    else if (key === "Delete")
        input = this.value.slice(0, start) + this.value.slice(end + 1);
    else
        console.error("Function: removeLetters(key) – invalid argument");

    if (searchContainer.match(input))
        searchContainer.display(input);
}

class Screen {
    constructor(container) {
        this.container = container;
    }

    display(container) {
        this.container.hide();
        this.container = container;
    }
}

class Container {
    selectedTile;
    tilesInRow;

    addTile(tile) {
        // Create div
        const div = document.createElement("div");
        div.setAttribute("class", "tile invisible");

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

        // Add event listeners
        const self = this;
        div.onmouseover = function () {
            self.select(div);
        }
        div.onmouseout = function () {
            if (screen.container === defaultContainer)
                self.select(null);
        }
        setTimeout(function () {
            div.display();
        }, 20);

        container.appendChild(div);
    }

    removeTiles() {
        while (container.firstChild)
            container.removeChild(container.lastChild);
    }

    select(tile) {
        if (this.selectedTile !== undefined && this.selectedTile !== null)
            this.selectedTile.classList.remove("selected");
        this.selectedTile = tile;
        if (this.selectedTile !== undefined && this.selectedTile !== null)
            this.selectedTile.classList.add("selected");
    }

    hide() {}
}

class DefaultContainer extends Container {
    rows;
    pages;
    currentPage = 1;

    updateInfo() {
        // Calculate current values
        this.tilesInRow = Math.floor((window.innerWidth - freeSpaceVertically) / extendedTileWidth);
        this.rows = Math.max(Math.floor((window.innerHeight - freeSpaceHorizontally) / extendedTileHeight), 0);
        this.pages = Math.ceil(tiles.length / (this.tilesInRow * this.rows));

        // Correct currentPage and pageCounter if necessary
        if (this.currentPage > this.pages)
            this.currentPage = this.pages;
        if (this.pages === 1 || this.pages === Infinity)
            pageCounter.hide();
        else pageCounter.display();

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
            leftArrow.hide();
        else leftArrow.display();
        if (this.currentPage === this.pages)  // Last page
            rightArrow.hide();
        else rightArrow.display();
        if (this.pages === Infinity) { // Make arrows invisible iff there are no tiles
            leftArrow.hide();
            rightArrow.hide();
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

    hide() {
        leftArrow.hide();
        rightArrow.hide();
        pageCounter.hide();
    }

    display() {
        screen.display(this);
        leftArrow.display();
        rightArrow.display();
        pageCounter.display();
        this.update();
    }
}

class SearchContainer extends Container {
    addMatchingTiles(maxTiles, pattern1, pattern2 = ".") {
        for (let tile of tiles) {
            if (container.childNodes.length === maxTiles)
                break;
            const name = tile.name.toLowerCase();
            if (name.match(pattern1) && name.match(pattern2))
                this.addTile(tile);
        }
    }

    addTiles(input) {
        this.tilesInRow = Math.min(Math.floor((window.innerWidth - freeSpaceVertically) / 280), 4);

        // At first, display tiles that match the input from the beginning
        this.addMatchingTiles(this.tilesInRow, new RegExp("^" + input.toLowerCase()));

        // Then display these that match not from the beginning
        this.addMatchingTiles(this.tilesInRow,
            new RegExp("^(?!" + input.toLowerCase() + ").*"), input.toLowerCase());

        this.select(container.firstChild);
    }

    match(input) {
        for (const tile of tiles) {
            const name = tile.name.toLowerCase();
            if (name.match(input.toLowerCase()))
                return true;
        }
        return false;
    }

    updateMargins() {
        let howManyTiles = container.childNodes.length;
        for (const tile of container.childNodes) {
            tile.style.marginLeft = tile.style.marginRight = "40px";
            tile.style.marginTop = (window.innerHeight - freeSpaceHorizontally - 250) / 2 + "px";
        }
        if (howManyTiles > 0)
            container.childNodes[0].style.marginLeft =
                Math.floor(((window.innerWidth - freeSpaceVertically - (howManyTiles - 1) * 280) - 200) / 2) + "px";
    }

    update(input) {
        this.removeTiles();
        this.addTiles(input);
        this.updateMargins();
    }

    useSelectedTile() {
        window.location = this.selectedTile.firstChild;
    }

    selectRight() {
        const array = container.childNodes;
        for (let index = 0; index < array.length - 1; index++) {
            if (this.selectedTile === array[index]) {
                this.select(array[index + 1]);
                break;
            }
        }
    }

    selectLeft() {
        const array = container.childNodes;
        for (let index = 1; index < array.length; index++) {
            if (this.selectedTile === array[index]) {
                this.select(array[index - 1]);
                break;
            }
        }
    }

    display(input) {
        screen.display(this);
        this.update(input);
    }
}

class GoogleSearchContainer extends Container {
    engine = 0;

    createImg() {
        const img = document.createElement("img");
        img.setAttribute("id", "google-image");
        img.setAttribute("class", "invisible");
        img.setAttribute("src", "/images/" + searchEngines[this.engine].src);

        img.style.top = Math.round(window.innerHeight / 2) - 130 + "px";
        img.style.left = window.innerWidth / 2 - 200 + 125 + "px"

        img.onload = () => {
            img.display();
        }
        return img;
    }

    addText() {
        const span = document.createElement("span");
        span.setAttribute("id", "google-span");
        span.setAttribute("class", "invisible");
        span.innerHTML = "Press <kbd>Enter</kbd> to search in";

        const img = this.createImg();

        container.appendChild(span);
        container.appendChild(img);

        span.style.left = window.innerWidth / 2 - 600 + "px";
        span.style.top = Math.round(window.innerHeight / 2) - 125 + "px";
        img.style.left = window.innerWidth / 2 - 200 + 125 + "px";
        img.style.top = Math.round(window.innerHeight / 2 - 130) + "px";

        img.onload = function () {
            span.display();
            img.display();
        }
    }

    display() {
        screen.display(this);
        this.removeTiles();
        this.addText();
    }

    fadeOutUp(img) {
        img.classList.add("fade-up");
        img.ontransitionend = (e) => {
            if (e.propertyName === 'opacity')
                container.removeChild(img);
        }
    }

    fadeOutDown(img) {
        img.classList.add("fade-down");
        img.ontransitionend = (e) => {
            if (e.propertyName === 'opacity')
                container.removeChild(img);
        }
    }

    fadeInUp() {
        const img = this.createImg();
        img.classList.add("fade-down");
        setTimeout(function () {
            img.classList.remove("fade-down", "invisible");
        }, 25);
        img.ontransitioncancel = (e) => {
            container.removeChild(img);
        }
        return img;
    }

    fadeInDown() {
        const img = this.createImg();
        img.classList.add("fade-up");
        setTimeout(function () {
            img.classList.remove("fade-up", "invisible");
        }, 25);
        img.ontransitioncancel = (e) => {
            container.removeChild(img);
        }
        return img;
    }

    nextEngine() {
        this.fadeOutUp(container.lastChild);

        this.engine = (this.engine + 1) % searchEngines.length;
        container.appendChild(this.fadeInUp());
    }

    previousEngine() {
        this.fadeOutDown(container.lastChild);

        this.engine = (this.engine - 1 + searchEngines.length) % searchEngines.length;
        container.appendChild(this.fadeInDown());

    }

    search(input) {
        window.location = searchEngines[this.engine].href + input;
    }
}

const defaultContainer = new DefaultContainer();
const searchContainer = new SearchContainer();
const googleSearchContainer = new GoogleSearchContainer();
const screen = new Screen(defaultContainer);
let clock;

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
        clearTimeout(clock);
        clock = undefined;
        for (const element of container.children) {
            element.classList.add("no-transition");
            element.hide();
        }

        let tmp;
        switch (screen.container) {
            case defaultContainer:
                tmp = defaultContainer.rows * defaultContainer.tilesInRow;
                defaultContainer.updateInfo();

                // Update layout if necessary
                if (tmp !== defaultContainer.rows * defaultContainer.tilesInRow) {
                    defaultContainer.updateArrows();
                    defaultContainer.removeTiles();
                    defaultContainer.addTiles();
                }

                defaultContainer.updateMargins();
                break;

            case searchContainer:
                tmp = searchContainer.tilesInRow;
                if (tmp !== Math.min(Math.floor((window.innerWidth - freeSpaceVertically) / 280), 4))
                    searchContainer.update(searchBar.value);
                else
                    searchContainer.updateMargins();
                break;

            case googleSearchContainer:
                break;
        }

        clock = setTimeout(function () {
            for (const element of container.children) {
                element.classList.remove("no-transition");
                element.display();
            }
        }, 500);
    });

    // defaultContainer is displayed
    window.addEventListener("keydown", function (e) {
        if (screen.container === defaultContainer) {
            switch (e.key) {
                case "ArrowLeft":
                    defaultContainer.moveLeft();
                    break;
                case "ArrowRight":
                    defaultContainer.moveRight();
                    break;
            }
        }
    });

    // searchContainer is displayed
    window.addEventListener("keydown", function (e) {
        if (screen.container === searchContainer) {
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    searchContainer.selectLeft();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    searchContainer.selectRight();
                    break;
                case "Backspace":
                case "Delete":
                    searchBar.removeLetters(e.key);
                    break;
                case "Enter":
                    searchContainer.useSelectedTile();
                    break;
                case "Escape":
                    searchBar.value = "";
                    defaultContainer.display();
                    break;
            }
        }
    });

    // googleSearchContainer is displayed
    window.addEventListener("keydown", function (e) {
        if (screen.container === googleSearchContainer) {
            switch (e.key) {
                case "ArrowDown":
                    googleSearchContainer.nextEngine();
                    break;
                case "ArrowUp":
                    googleSearchContainer.previousEngine();
                    break;
                case "Backspace":
                case "Delete":
                    searchBar.removeLetters(e.key);
                    break;
                case "Enter":
                    googleSearchContainer.search(searchBar.value);
                    break;
                case "Escape":
                    searchBar.value = "";
                    defaultContainer.display();
                    break;
                case "0": // TEST
                    googleSearchContainer.nextEngine();
            }
        }
    });

    // Search bar control
    window.addEventListener("keydown", function (e) {
        switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                searchBar.focus();
                break;
            case "ArrowDown":
                e.preventDefault();
                searchBar.blur();
                break;
            case "Enter":
                if (e.ctrlKey)
                    window.location = "https://www.google.com/search?q=" + searchBar.value;
                break;
        }

        if (e.key.isSign()) {
            searchBar.focus();
            switch (screen.container) {
                case defaultContainer:
                    if (searchContainer.match(searchBar.value + e.key))
                        searchContainer.display(searchBar.value + e.key);
                    else
                        googleSearchContainer.display();
                    break;
                case searchContainer:
                    if (searchContainer.match(searchBar.value + e.key))
                        searchContainer.update(searchBar.value + e.key);
                    else
                        googleSearchContainer.display();
                    break;
            }
        }
    });
};