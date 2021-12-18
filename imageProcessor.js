const sharp = require("sharp");

// Requires: All images must be of the same size
module.exports = async function compositeImages(imagePath2dArr) {
    var compImage = null;
    console.log(imagePath2dArr[0][0]);
    const metadata = await sharp(imagePath2dArr[0][0]).metadata();
    console.log(metadata);
    const compArr = [];
    let count = 0;
    for (let i = 0; i < imagePath2dArr.length; i++) {
        for (let j = 0; j < imagePath2dArr[0].length; j++) {
            compArr[count] = {
                input: imagePath2dArr[i][j],
                top: metadata.height * i,
                left: metadata.width * j,
            };
            count++;
        }
    }
    console.log(compArr);
    try {
      var temp = await sharp({
            create: {
            width: imagePath2dArr[0].length * metadata.width,
            height: imagePath2dArr.length * metadata.height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0.0 }
            }
        });
        console.log("Sharp Created");
        var tempPng = temp.png();
        console.log("Png created");
        compImage = tempPng.composite(compArr);
        console.log("Comp created");
    } catch (error) {
      console.log(error);
    }
    return compImage;
  }