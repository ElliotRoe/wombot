const download = require("./cli");
const compImages = require("./imageProcessor");
const fs = require('fs');
const fsExtra = require('fs-extra');
const printf = require('printf');

var downloadCount = 0;
var path2dArr = [];
var totalPrompts;

const IMAGE_DIR_NAME = "collaged_image";
const METADATA_DIR_NAME = "meta_data"

function findCoors(text, array) {
    for (let y = 0; y < array.length; y++) {
        for (let x = 0; x < array[0].length; x++) {
            console.log(text + " ?= " + array[y][x] + " | " + (text === array[y][x]));
            if (text === array[y][x]) {
                array[y][x] = null;
                return {x: x, y: y}
            }
        }
    }
    return {x: -1, y: -1}
}

function saveInFolder(image, prompts, path) {
    if (fs.existsSync(path)) {
        fsExtra.emptyDirSync(path);
    } else {
        fs.mkdirSync(path);
    }
    console.log("prompts: " + prompts);
    image.toFile(path + "/" + IMAGE_DIR_NAME + ".png");
    fs.writeFileSync(path + "/" + METADATA_DIR_NAME, array2dFormat(prompts));
}

const cellSize = 20;

function array2dFormat(array) {
    let i = 0;
    var line = '';
    while (i < array[0].length * cellSize + array[0].length + 1) {
        line += '_';
        i++;
    }
    var output = "";
    array.forEach(row => {
        output += line + '\n';
        row.forEach(element => {
            output += printf('|%' + cellSize + 's', element);
        });
        output += '|\n'

    });
    return output + line + '\n';
}

async function startDownload(prompt2dArr, style, path) {
    totalPrompts = prompt2dArr.length * prompt2dArr[0].length;
    var promptsCopy = [];
    console.log(totalPrompts);
    fsExtra.emptyDirSync("./generated");
    prompt2dArr.forEach(row => {
        row.forEach(element => {
            download(element, style, 1, false, false, true).then((data) => {
                console.log(data.path);
                console.log(path2dArr);
                let promptCoors = findCoors(data.prompt, prompt2dArr);
                if (!path2dArr[promptCoors.y]) {
                    path2dArr[promptCoors.y] = [];
                    promptsCopy[promptCoors.y] = []
                }
                path2dArr[promptCoors.y][promptCoors.x] = data.path;
                promptsCopy[promptCoors.y][promptCoors.x] = data.prompt;
                downloadCount++;
                console.log("Download " + downloadCount + " complete");
                if (downloadCount == totalPrompts) {
                    console.log("Collaging Images");
                    compImages(path2dArr).then((compImage) => {
                        saveInFolder(compImage, promptsCopy, path);
                    });
                }
            });
        });
    });
}

let rawdata = fs.readFileSync('./input.json');
let inputData = JSON.parse(rawdata);
startDownload(inputData.promptArr, inputData.style, inputData.outputFolderPath);