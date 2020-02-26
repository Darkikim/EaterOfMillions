// ==UserScript==
// @name        EaterOfMillions
// @namespace   Violentmonkey Scripts
// @version     0.3.5
// @match       https://manganelo.com/chapter/*
// @match       https://mangafun.top/*
// @grant       none
// @run-at      document-idle
// @require     https://cdn.jsdelivr.net/npm/jszip@3.2.2/dist/jszip.js
// @require     https://cdn.jsdelivr.net/npm/filesaver.js@1.3.4/FileSaver.js
// @description Automatic mangakakalot chapter downloader
// ==/UserScript==

// Define some variables and the dowload button

// Are we in a chapter page ?
let foundChapter = false; 

let scan;
let chapterName;
let chapter;
let pages = new Array();
let pageIndex = 1;

// For Ziping purpose
let zipFile = new JSZip();


let downloadButton = document.createElement("a");
downloadButton.style.padding = "0.3rem 1rem";
downloadButton.style.background = "#56158b";
downloadButton.style.marginTop = "0.625rem";
downloadButton.style.cursor = "pointer";
downloadButton.style.textDecoration = "none";
downloadButton.style.color = "white";
downloadButton.textContent = "Download";

if(window.location.hostname == "mangakakalot.com")
{
  foundChapter = true;
  
  scan = document.querySelector('#vungdoc');
  let gohome = scan.nextElementSibling;
  gohome.innerHTML = "";
  gohome.style.marginTop = "3rem";
  gohome.style.marginBottom = "3rem";
  gohome.insertAdjacentElement('beforeend', downloadButton);
  
  chapterName = document.querySelector(".info-top-chapter").querySelector("h2").textContent;
  
  chapter = scan.querySelectorAll('img');
  chapter.forEach(page =>
  {
      pages.push(page.src);
  });

  scan.innerHTML = "";
}
else if(window.location.hostname == "mangafun.top")
{
  foundChapter = true;
  
  scan = document.querySelector("#arraydata");
  
  chapterName = document.querySelector(".chapter-title").textContent;
  
  pages = scan.textContent.split(",");
  
  scan = scan.nextElementSibling;
  scan.innerHTML = "";
  scan.style.marginTop = "3rem";
  scan.style.marginBottom = "3rem";
  scan.insertAdjacentElement('beforeend', downloadButton);
  
        
}
if(foundChapter)
{
let progressBar = document.createElement("progress");
progressBar.value = 0;
progressBar.max = pages.length;
scan.insertAdjacentElement("beforeend",progressBar);

let paragraph = document.createElement("p");
paragraph.textContent = "Downloading please wait ...";
scan.insertAdjacentElement("beforeend",paragraph);

let myRegex = new RegExp(/[a-zA-Z\d]{1,}\.[(jpg)(png)(jpeg)(gif)]{3}/);

  pages.forEach(page =>
  {
    let myHeader = new Headers();
    myHeader.append("content-Type", "image/jpg");
    fetch("https://api.codetabs.com/v1/proxy?quest=" + page, {method: 'GET', header: myHeader, mode: 'cors', cache: 'default', referrerPolicy: "no-referrer"}).then((response)=>
    {
      return response.blob();

    }).then((blob)=>
    {
      progressBar.value += 1;
      paragraph.textContent = "Parts " + progressBar.value.toString() + " / " + progressBar.max.toString();
      let currentName = myRegex.exec(page).toString();
      zipFile.file(currentName, blob, { base64: true });
      pageIndex++;
      if(pageIndex == pages.length)
      {
        zipFile.generateAsync({type: "blob",compression: "DEFLATE"}).then((content)=>
        {
            saveAs(content, chapterName + ".zip");
        });
      }
    });
  });
}
