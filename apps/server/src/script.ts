// import * as cheerio from "cheerio";

// const $ = cheerio.load( `<html><body>
//   <img data-image-src-name="my_image_1" src="https://example.com/image.png">
//   <img src="https://example2.com/image.png">
//   <img src="https://example3.com/image.png">
//   <img src="https://example4.com/image.png">
//   </body></html>`
// );

// $("img[data-image-src-name]").each((index, element) => {
//   const imgSrcName = $(element).attr("data-image-src-name");
//   $(element).attr("src", `{{ ${imgSrcName} }}`);
// });

// const x = $.html();
// console.log(x);
