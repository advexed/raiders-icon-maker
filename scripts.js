//this code sucks so bad it's not even funny 
//at least it's not ai i guess

document.addEventListener("DOMContentLoaded", initSite);

function initSite() {
    document.querySelectorAll(`.buttons button:not(#colour)`).forEach((el) => {
        let prevSibling = el.previousElementSibling
        let prevSiblingCount = 0
        while (prevSibling != null) {
            prevSiblingCount++
            prevSibling = prevSibling.previousElementSibling
        }
        el.addEventListener("click", () => {
            document.querySelectorAll(`#${el.closest('li').id} .buttons button`).forEach((element) => {
                element.classList.remove('selected');
            }
            )
            el.classList.add('selected')
            setData(prevSiblingCount);
            advanceStep();
        }, { passive: true });
    })
    Coloris({
        themeMode: 'dark',
        alpha: false,
        swatches: [
            '#78cf1a',
            '#4acf6b',
            '#26ccb3',
            '#28aad6',
            '#0578de',
            '#3d7af5',
            '#5966ff',
            '#a951d6',
            '#c32bce',
            '#cf56b0',
        ],
        onChange: (color) => {
            inkColor = color
        },
    });
    back_sfx = new Audio('assets/ui/back.wav')
    next_sfx = new Audio('assets/ui/next.wav')
    finish_sfx = new Audio('assets/ui/finish.wav')

    styles = document.styleSheets[0]

    document.querySelector('.clr-field').style.color = "rgb(38, 204, 179)"
}

var img
var transitioning
var step = 1
var species
var type
var hair
var brows
var skin
var inkColor
var back_sfx
var next_sfx
var finish_sfx
var styles
const steps = ["type", "hair", "eyebrows", "skin", "col", "download"]

function openPicker() {
    document.querySelector('#fakeInput').click()
}

async function playSound(type) {
    await wait(50)
    switch (type) {
        case "next":
            next_sfx.currentTime = 0;
            next_sfx.play();
            break;
        case "finish":
            finish_sfx.currentTime = 0;
            finish_sfx.play();
            break;
        case "back":
            back_sfx.currentTime = 0;
            back_sfx.play();
            break;
    }
}

function setData(id) {
    switch (step) {
        case 1:
            species = (((id + 1) / 2) > 1) ? "octo" : "squid"
            type = (id == 0 || id == 2) ? "fem" : "masc"
            break;
        case 2:
            hair = id
            break;
        case 3:
            brows = id
            break;
        case 4:
            skin = id
            break;
        case 5:
            break;
    }
}

function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.src = url
        image.addEventListener('load', () => {
            resolve(image)
        })
    })
}

async function createIcon() {
    const canvas = document.createElement("canvas")
    const canvas2 = document.createElement("canvas")
    const canvas3 = document.createElement("canvas")
    canvas.width = 354
    canvas2.width = 354
    canvas3.width = 280
    canvas.height = 512
    canvas2.height = 512
    canvas3.height = 128
    const ctx = canvas.getContext(`2d`)
    const ctx2 = canvas2.getContext(`2d`)
    const ctx3 = canvas3.getContext(`2d`)

    let faceImg, hairImg, eyebrowsImg

    [faceImg, hairImg, eyebrowsImg] = await Promise.all([
        loadImage(`assets/faces/${species}/${species == "squid" ? skin : skin + "_" + type}.png`),
        loadImage(`assets/hair/${species}/${hair}.png`),
        loadImage(`assets/brows/${species}/${brows}_${type}.png`)
    ]);


    if (!inkColor) inkColor = "#26ccb3"
    let tempHsl = hexToHSL(inkColor)
    if ((tempHsl.s - (10 / 100)) > 0) {
        tempHsl.l = tempHsl.l - (10 / 100)
    } else { tempHsl = '#000000' }

    let darkerCol = '#000000'
    if (tempHsl != '#000000') darkerCol = hslToRgb(tempHsl.h, tempHsl.s, tempHsl.l)

    ctx3.drawImage(eyebrowsImg, 0, 0, canvas3.width, canvas3.height)
    ctx3.fillStyle = darkerCol
    ctx3.globalCompositeOperation = "source-in";
    ctx3.fillRect(0, 0, canvas3.width, canvas3.height)

    ctx2.drawImage(hairImg, 0, 0, canvas.width, canvas.height)

    ctx2.globalCompositeOperation = "source-in";
    ctx2.fillStyle = inkColor
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height)


    ctx.drawImage(faceImg, 0, 0, canvas.width, canvas.height)
    ctx.drawImage(eyebrowsImg, 121, 209, eyebrowsImg.width * 0.4, eyebrowsImg.height * 0.4)
    ctx.globalCompositeOperation = 'screen'
    ctx.drawImage(canvas3, 121, 209, eyebrowsImg.width * 0.4, eyebrowsImg.height * 0.4)
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(hairImg, 0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'screen'
    ctx.drawImage(canvas2, 0, 0, canvas.width, canvas.height)

    img = canvas.toDataURL('image/png')
    document.querySelector("#preview").src = img
}

async function downloadIcon(button) {
    if (button.classList.contains(`active`)) return
    playSound('finish')
    button.classList.add(`active`)
    await wait(250)
    let anchor = document.createElement('a')
    let url = await fetch(img)
    let blob = await url.blob()
    let data = URL.createObjectURL(blob)
    anchor.href = data
    anchor.download = 'icon'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove
}

async function advanceStep() {
    if (transitioning) return
    transitioning = true

    let contentEl = document.querySelector(`#content`)
    let currentLi = contentEl.querySelector(`li#${steps[step - 1]}`)

    switch (step) {
        case 1:
            playSound('next')
            currentLi.nextElementSibling.classList.add(species)
            break;
        case 2:
            playSound('next')
            styles.insertRule(`#brows0:before, #brows0:after { background-position-x: calc(100% * (${hair} / 6)), calc(100% * (0 / 3));}`);
            styles.insertRule(`#brows1:before, #brows1:after { background-position-x: calc(100% * (${hair} / 6)), calc(100% * (1 / 3));}`);
            styles.insertRule(`#brows2:before, #brows2:after { background-position-x: calc(100% * (${hair} / 6)), calc(100% * (2 / 3));}`);
            styles.insertRule(`#brows3:before, #brows3:after { background-position-x: calc(100% * (${hair} / 6)), calc(100% * (3 / 3));}`);
            styles.insertRule(`#eyebrows .buttons button::before, #eyebrows .buttons button::after { background-image: url(assets/ui/hairsheet_${species}.png), url(assets/ui/browsheet_${type}_${species}.png), url(assets/ui/face_${species}.png);}`);
            break;
        case 5:
            playSound('finish')
            createIcon()
            break
        default:
            playSound('next')
            break
    }

    //wait 0.15 seconds

    await wait(200)

    contentEl.classList.remove(`step${step}`)
    currentLi.inert = true
    contentEl.classList.add(`step${step + 1}`)
    step++
    // wait 0.3 seconds for the transition to finish
    await wait(300)
    transitioning = false
}

async function retreatStep() {
    if (transitioning || step <= 1) return
    transitioning = true
    playSound('back')
    let contentEl = document.querySelector(`#content`)
    let previousLi = contentEl.querySelector(`li#${steps[step - 2]}`)

    switch (step - 1) {
        case 1:
            deleteStuff('species')
            break;
        case 2:
            deleteStuff('rules')
            break;
        case 5:
            deleteStuff('active')
            break;
    }

    contentEl.classList.add(`step${step - 1}`)
    previousLi.inert = false
    contentEl.classList.remove(`step${step}`)
    step--
    // wait 0.3 seconds for the transition to finish
    await wait(300)
    transitioning = false
}


function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function deleteStuff(stuff) {
    switch (stuff) {
        case "rules":
            await wait(250)
            styles.deleteRule(`#eyebrows .buttons button::before, #eyebrows .buttons button::after { background-image: url(assets/ui/hairsheet_${species}.png), url(assets/ui/browsheet_${type}_${species}.png), url(assets/ui/face_${species}.png);}`);
            styles.deleteRule(`#brows3:before, #brows3:after { background-position-x: calc(100% * (${hair} / 6)), calc(100% * (3 / 3));}`);
            styles.deleteRule(`#brows2:before, #brows2:after { background-position-x: calc(100% * (${hair} / 6)), calc(100% * (2 / 3));}`);
            styles.deleteRule(`#brows1:before, #brows1:after { background-position-x: calc(100% * (${hair} / 6)), calc(100% * (1 / 3));}`);
            styles.deleteRule(`#brows0:before, #brows0:after { background-position-x: calc(100% * (${hair} / 6)), calc(100% * (0 / 3));}`);
            break;
        case "species":
            await wait(250)
            document.querySelector('#hair').classList.remove(species)
            break;
        case "active":
            document.querySelector('#complete').classList.remove('active')
            await wait(250)
            document.querySelector('#save').classList.remove('active')
            break;
    }
}

// stolen from https://gist.github.com/xenozauros/f6e185c8de2a04cdfecf
function hexToHSL(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    var HSL = new Object();
    HSL['h'] = h;
    HSL['s'] = s;
    HSL['l'] = l;
    return HSL;
}

// stolen from https://gist.github.com/mjackson/5311256
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return `rgb(${r * 255},${g * 255},${b * 255})`;
}