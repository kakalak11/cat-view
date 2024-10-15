const { div } = van.tags;

// function loadingScreen() {
//     const _div = div({ id: "loading-scrren-wrapper", class: "wrapper" },
//         div({ class: "dot" }),
//         div({ class: "dot" }),
//         div({ class: "dot" }),
//         div({ class: "dot" }),
//         div({ class: "dot" }),
//     );
//     const loadingLabel = div({ class: "wrapper loading-label" }, div({ class: "loading-label" }, "LOADING"))

//     let count = 0;
//     let loopRate = 1000 * 0.2;

//     setInterval(() => {
//         const childNodes = Array.from(_div.children);
//         const child = childNodes[count % childNodes.length]; child.classList.toggle("animation-selected");
//         count++;
//     }, loopRate);

//     const bgGradientDiv = div({ class: "gradient" }, loadingLabel, _div);

//     return bgGradientDiv;
// }

function loadingScreen() {
    const _div = div({ id: "loading-scrren-wrapper", class: "wrapper" },
        div({ class: "loader" })
    )
    const bgGradientDiv = div({ class: "gradient" }, _div);

    return bgGradientDiv;
}

export default loadingScreen();