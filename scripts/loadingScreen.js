const { div } = van.tags;

export default function loadingScreen() {


    const _div = div({ id: "loading-scrren-wrapper", class: "wrapper" },
        div({ class: "dot" }),
        div({ class: "dot" }),
        div({ class: "dot" }),
        div({ class: "dot" }),
        div({ class: "dot" }),
    )

    let count = 0;
    let loopRate = 1000 * 0.2;

    setInterval(() => {
        const childNodes = Array.from(_div.children);
        const child = childNodes[count % childNodes.length]; child.classList.toggle("animation-selected");
        count++;
    }, loopRate);

    return _div;
} 
