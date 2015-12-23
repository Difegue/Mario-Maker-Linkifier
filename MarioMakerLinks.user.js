// ==UserScript==
// @name        Mario Maker Linkifier
// @namespace   mml
// @description Bookmark all those levels without opening a billion tabs.
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @include *
// @exclude http://supermariomakerbookmark.nintendo.net/*
// @exclude https://supermariomakerbookmark.nintendo.net/*
// @version     0.5
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/icon.png
// @updateURL    https://github.com/Difegue/Mario-Maker-Linkifier/raw/master/MarioMakerLinks.user.js
// ==/UserScript==

//Maximum number of simultaneous requests to bookmark website. You can up this if your browser handles it.
maxRequests = 7;
currentRequests = 0;
totalRequests = 0;


//Bookmarks a course.
function marioMakerBookmark(HTMLNode,courseURL) {
console.log(HTMLNode);
//make a POST request to https://supermariomakerbookmark.nintendo.net/courses/[courseID]/play_at_later.
postURL = courseURL+"/play_at_later";

//First, load the courseURL page and grab a CSRF token.
GM_xmlhttpRequest({
     method: "GET",
     url: courseURL,
     onload: function(xhr) {

        var result = xhr.responseText;
        //console.log("> ", data.contents);
        //console.log($.parseHTML(result));
        var parsed = $('<div/>').append(result);

        var token = "";
        token = parsed.find('meta[name="csrf-token"]').attr('content');
        //alert("Making POST to "+postURL+ "with token "+token);
       
        if (token !="")
            GM_xmlhttpRequest({
                 method: "POST",
                 url: postURL,
                 data: "",
                 headers: {
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Pragma": "no-cache",
                    "Referer": courseURL,
                    "Host": "supermariomakerbookmark.nintendo.net",
                    "X-CSRF-Token": token,
                    "X-Requested-With": "XMLHttpRequest",
                  },
                 onload: function(xhr) {
                    //alert("wow! "+xhr.responseText);
                    $(HTMLNode).text("Bookmarked!");
                 },
                 onerror: function(xhr) {
                    alert("error: "+xhr.responseText);
                 }
            });
        else
            alert("Couldn't get token. Please make sure you're logged in to the Mario Maker Bookmark website.");
               
       },
     onerror: function(xhr) {
     
        alert("Error while bookmarking.");
     }
    
    });
    
}



//For a given bookmark URL, create a pretty line with the level's name and a bookmark button.
//Todo: Image on hover ?
function marioMakerCreateLink(courseHTMLNode) {

    //console.log(currentRequests);
    if(currentRequests > maxRequests) {//Too many requests right now.
        setTimeout(marioMakerCreateLink, 1000, courseHTMLNode);//wait a second then recheck
        return;
    }

    currentRequests++;
    
    //Add kawaii logo
    $(courseHTMLNode).before('<img style="margin-right: 3px;" src="http://supermariomakerbookmark.nintendo.net/assets/favicon/favicon-6529ac1b94d398a37ceabd51acb07a94.ico" />');
    
    var courseURL = courseHTMLNode.href;
    //console.log("Getting info for "+courseURL);
    
    //Grab the HTML page matching the course and get course info
    GM_xmlhttpRequest({
     method: "GET",
     url: courseURL,
     onload: function(xhr) {

        var result = xhr.responseText;
        
        
        //console.log("> ", data.contents);
        //console.log($.parseHTML(result));
        var parsed = $('<div/>').append(result);
        
        var course = parsed.find(".course-title");
        if (course.length == 0) //does the course exist ?
            {
                courseHTMLNode.textContent = "Course deleted.";
                $(courseHTMLNode).attr('smmprocessed','true');
            }
        else
            {
            var courseTitle = course.text();
            var courseMaker = parsed.find(".name")[0].innerHTML;
            var courseDiffLevel = parsed.find(".course-header").text().trim().substring(1);
            
            if (courseDiffLevel == "")
                courseDiffLevel = "Unrated";
       
            //console.log("got info: "+courseTitle+" ("+courseDiffLevel+") by "+courseMaker);
            
            courseHTMLNode.textContent = courseTitle+" ("+courseDiffLevel+") by "+courseMaker;
            $(courseHTMLNode).attr('smmprocessed','true');
            
            //Course exists, we can add the Bookmark link.
             var string = '<a style="text-decoration: underline; margin-left: 10px; cursor:pointer" >Bookmark</a>';
             $bookmarklink = $(string);  //if it's not a jQuery object, make it one
             $(courseHTMLNode).after($bookmarklink); //insert into DOM
             $bookmarklink.click(function(){ marioMakerBookmark($bookmarklink,courseURL); }); //add the function on click
             
            }
            
        //Request is done
        currentRequests--;
        totalRequests--;
        
        },
     onerror: function(xhr) {
     
        courseHTMLNode.textContent = "Error processing this course.";
        $(courseHTMLNode).attr('smmprocessed','true');
        currentRequests--;
        totalRequests--;
        },
        
     ontimeout: function(xhr) {
     
        courseHTMLNode.textContent = "Timed out processing this course.";
        $(courseHTMLNode).attr('smmprocessed','true');
        currentRequests--;
        totalRequests--;   
        },
      });

    return;
}



//Replaces Bookmark links found in <a> tags with a custom link + Bookmark button.
//a typical SMM Bookmark link is https://supermariomakerbookmark.nintendo.net/courses/7829-0000-0047-74F8
function marioMakerReplaceLinks() {

    if(totalRequests > 2) {//Is the previous call done ?
        refresh = setTimeout(marioMakerReplaceLinks, 2000);//wait then recheck
        //console.log(totalRequests);
        return;
    }

    //console.log("Searching for Bookmark links...");
    
    //xpath is pretty fast for this
    textNodes = document.evaluate(
      ".//a[contains(@href,'supermariomakerbookmark.nintendo.net/courses') and not(@smmprocessed='true')]",
      document.body,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null);
      
    //console.log(textNodes);
    
    for ( var i=0 ; i < textNodes.snapshotLength; i++ )
        {
          var thisCourseURL = textNodes.snapshotItem(i);
          //console.log( thisCourseURL.href );
          //new request
          
          totalRequests++;
          marioMakerCreateLink(thisCourseURL);
          
        }
    
    //We're done, set a new timeout
    refresh = setTimeout(marioMakerReplaceLinks, 2000);

}



console.log("Executing SMM Linkifier v1...");
refresh = setTimeout(marioMakerReplaceLinks, 2000);