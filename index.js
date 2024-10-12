import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.5.2.min.js";
const {
    a,
    aside,
    button,
    div,
    footer,
    h1,
    h3,
    header,
    img,
    main,
    p,
    section,
    small,
    ul,
    li,
} = van.tags;

const API_KEY =
    "live_xZjBI0DsGYFT7iYVbmdmtoT8AIW0xd2AWLQYXW9Ua0dDqMYA5Ucue761hsXWdVIT";
const headers = { "x-api-key": API_KEY, "Access-Control-Allow-Origin": true };
const baseUrl = "https://api.thecatapi.com/v1";
const storageKey = "favoriteCats";
const _localStorage = window.localStorage;
const params = new URLSearchParams(window.location.search);

/*
NOTE

- Find a way to cache all the fetched image to reduce server calls (like ReactQuery)
- Improve the css styling of the webpage
- Update detail screen
- Media query for multi devices
- Refactor getNewImage logic

*/

function getSavedImages() {
    if (!_localStorage) return [];
    let data = _localStorage.getItem(storageKey);
    if (data) {
        data = JSON.parse(data);
    }
    return data || [];
}

function showBreedInfo() {
    const ulDiv = ul({ class: "breed-info-list" });

    fetch("https://api.thecatapi.com/v1/breeds", headers)
        .then((response) => response.json())
        .then((data) => {
            for (const key in data[0]) {
                van.add(ulDiv, li({}, data[0][key]));
            }
        });

    return div({ class: "main-view" }, ulDiv);
}

function App() {
    const currentScreen = van.state("image-view");
    const imgData = van.state({});
    const savedImages = van.state(getSavedImages());
    const currentId = van.state(params.get("id"));
    const historyList = [];
    let currentHistoryId = 0;

    const listItems = van.derive(() => {
        const isNewAdded = savedImages.val.length > savedImages.oldVal.length;

        if (!savedImages.val.length) {
            return p(
                { style: "font-size:0.75em;text-align:center" },
                "Add your favorite meow right neow !!!"
            );
        } else {
            return renderList(savedImages.val, isNewAdded);
        }
    });

    const catImageDiv = van.derive(() => {
        if (Object.keys(imgData.val).length > 0) {
            const { url: src, width, height, id } = imgData.val;
            return img({ id: "cat-image", alt: "A cat", width, height, src });
        } else {
            return div({ class: "no-content-image" }, "No content");
        }
    });

    function saveImage(dataState) {
        const { id = null } = dataState.val;
        if (!_localStorage || !id) return;

        let favCats = _localStorage.getItem(storageKey);
        if (favCats) {
            favCats = JSON.parse(favCats);
            if (favCats.findIndex((favId) => id === favId) === -1) {
                favCats = favCats.concat(id);
            }
            savedImages.val = favCats;
            _localStorage.setItem(storageKey, JSON.stringify(favCats));
        } else {
            _localStorage.setItem(storageKey, JSON.stringify([id]));
        }
    }

    function fetchImage(id) {
        return fetch(`${baseUrl}/images/${id ? id : "search"}`, headers)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    data = data.pop();
                }
                return data;
            })
            .catch((err) => {
                throw new Error(err);
            });
    }

    function getNewImage(id = "") {
        // help, i dont know but i had to code like this
        fetchImage(id).then((data) => {
            setUrl(data.id);
            const historyIndex = historyList.indexOf((data) => id === data.id);
            if (historyIndex === -1) {
                currentHistoryId = historyList.push(data) - 1;
            } else {
                currentHistoryId = historyIndex;
            }

            imgData.val = data;
        });
    }

    function handleNextPrevButton(direction) {
        currentHistoryId += direction;
        if (historyList[currentHistoryId]) {
            imgData.val = historyList[currentHistoryId];
        } else if (currentHistoryId < 0) {
            imgData.val = {};
			currentHistoryId = 0;
        } else {
            getNewImage();
        }
    }

    function renderList(list = [], isNewAdded) {
        return ul(
            { id: "favorite-list" },
            "",
            list.map((id, index) => {
                const isLastItem = index === list.length - 1;
                const isCurrentFavorite =
                    (isNewAdded && isLastItem) || currentId.val === id;

                return li(
                    {
                        style: "margin: 5px",
                        class: isCurrentFavorite ? "selected" : "",
                        onclick: (evt) => {
                            evt.currentTarget.classList.add("selected");
                            setUrl(id);
                            currentId.val = id;
                        },
                    },
                    id
                );
            })
        );
    }

    function setUrl(id) {
        params.set("id", id);
        window.history.replaceState({}, "", `${location.pathname}?${params}`);
    }

    // const detailViewDiv = showBreedInfo();
    const imgViewDiv = div(
        { class: "main-view" },
        div({ class: "image-container" }, catImageDiv),
        div(
            { class: "button-container" },
            button(
                {
                    onclick: handleNextPrevButton.bind(this, -1),
                },
                "Previous"
            ),
            button(
                { onclick: () => (currentScreen.val = "image-view") },
                "Detail"
            ),
            button(
                {
                    onclick: handleNextPrevButton.bind(this, 1),
                },
                "Next"
            )
        )
    );

    return div(
        header(
            h1("View cat for peace of mind"),
            p("This is a front-end for cat API"),
            div(
                "Try yours here 👉 ",
                a({ href: "https://thecatapi.com/" }, "https://thecatapi.com/")
            )
        ),
        main(
            div(
                { class: "parent" },
                aside(
                    { class: "side-bar" },
                    button({ onclick: getNewImage.bind(this, "") }, "New Cat"),
                    button(
                        { onclick: saveImage.bind(this, imgData) },
                        "Save cat"
                    ),
                    button({ id: "myBtn" }, "Open Saved"),
                    section(
                        { class: "favorite-section" },
                        h3("Your favorite cats"),
                        listItems
                    )
                ),
                van.derive(() =>
                    currentScreen.val == "image-view"
                        ? imgViewDiv
                        : detailViewDiv
                )
            )
        ),
        footer(small("Coded by kakalak"))
    );
}

van.add(document.body, App());
