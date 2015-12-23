// ==UserScript==
// @name        Mario Maker Linkifier
// @namespace   mml
// @description Bookmark all those levels without opening a billion tabs.
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @include *
// @exclude http://supermariomakerbookmark.nintendo.net/*
// @exclude https://supermariomakerbookmark.nintendo.net/*
// @version     0.5
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/icon.png
// @updateURL    https://github.com/Difegue/Mario-Maker-Linkifier/raw/master/MarioMakerLinks.user.js
// ==/UserScript==

//Time between parsings of the page.
var parseInterval = 5000;

//Maximum number of simultaneous requests to bookmark website. You can up this if your browser handles it.
var maxRequests = 5;
var currentRequests = 0;
var totalRequests = 0;

//All the course images are hosted there. Pretty handy.
var thumbLink = "https://dypqnhofrd2x2.cloudfront.net/";

//Shamelessly stealing this
var codeRegex = /([a-fA-F0-9]{4}-){3}[a-fA-F0-9]{4}/g;
var courseRegex = /(https?:\/\/)?supermariomakerbookmark.nintendo.net\/(courses)\/[_\-a-zA-Z0-9]+/g;
var profileRegex = /(https?:\/\/)?supermariomakerbookmark.nintendo.net\/(profile)\/[_\-a-zA-Z0-9]+/g;

//Ripped straight off the SMM website.
var starSVG = '<svg viewBox="0 0 40.9 40" xmlns="http://www.w3.org/2000/svg"><path d="M40.8 15.1c-.4-1.2-1.5-1.9-2.7-1.9H26.9L23.2 1.9C22.8.8 21.7 0 20.5 0c-1.2 0-2.3.8-2.7 1.9L14 13.1H2.8c-1.2 0-2.3.8-2.7 1.9-.4 1.2 0 2.4 1 3.2l8.9 6.7-3.4 11.4c-.4 1.2.1 2.4 1.1 3.1 1 .7 2.3.7 3.3 0l9.5-6.8 9.6 6.9c.5.4 1.1.5 1.7.5.6 0 1.2-.2 1.7-.5 1-.7 1.4-2 1.1-3.1L30.9 25l8.9-6.7c1-.8 1.4-2.1 1-3.2z" fill="#A58C26"/></svg>';
var playersSVG = '<svg viewBox="0 0 47.4 40" xmlns="http://www.w3.org/2000/svg"><g fill="#A58C26"><path d="M16.7 39.9c-3.7.7-7.1-2.1-8.9-8.2C5.4 23.6 3.3 21 2.9 16S12 3.8 17.6 7.2s1.1 12.1.6 14.2c-.7 3.3 0 4.5 1.8 7.8 2.6 4.7 1 9.8-3.3 10.7z"/><circle r="3" cy="3" cx="17.7"/><circle r="2.1" cy="3.8" cx="11.1"/><circle r="1.8" cy="5.9" cx="6.7"/><circle r="1.6" cy="8.9" cx="3.5"/><circle r="1.4" cy="12.4" cx="1.4"/><path d="M30.7 39.9c3.7.7 7.1-2.1 8.9-8.2 2.4-8.1 4.5-10.7 5-15.7S35.5 3.8 29.9 7.1s-1.1 12.1-.6 14.2c.7 3.3 0 4.5-1.8 7.8-2.6 4.7-1 9.9 3.2 10.8z"/><circle r="3" cy="3" cx="29.7"/><circle r="2.1" cy="3.8" cx="36.3"/><circle r="1.8" cy="5.9" cx="40.8"/><circle r="1.6" cy="8.9" cx="44"/><circle r="1.4" cy="12.3" cx="46.1"/></g></svg>'
//Flavor icons.
var bookmarkicon = 'https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/iconbookmark.png';
var bookmarkedicon = 'https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/iconbookmarked.png';
var unbookmarkicon = 'https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/iconunbookmark.png';

//Get a token for sending requests and call a function that needs it.
function marioMakerGetCSRFToken(courseID,callback) {

  tokenURL = "http://supermariomakerbookmark.nintendo.net/courses/"+courseID
  console.log("grabbing token from "+tokenURL);

  //First, load the courseURL page and grab a CSRF token.
  GM_xmlhttpRequest({
       method: "GET",
       url: tokenURL,
       onload: function(xhr) {

          var result = xhr.responseText;
          //console.log("> ", data.contents);
          console.log($.parseHTML(result));
          var parsed = $('<div/>').append(result);

          var token = "";
          token = parsed.find('meta[name="csrf-token"]').attr('content');

          if (token !="") //Once we have the token, pass it to the function that needs it.
            callback(token);
          else
              {
              alert("Couldn't get token. Please make sure you're logged in to the Mario Maker Bookmark website.");
              return 0;
              }

         },
       onerror: function(xhr) {
          alert("Error while bookmarking.");
          return 0;
       }
      
      });

}


//Bookmarks a course.
function marioMakerBookmark(courseID,callback) {

  marioMakerGetCSRFToken(courseID, function(token){

    //make a POST request to https://supermariomakerbookmark.nintendo.net/courses/[courseID]/play_at_later.
    postURL = "https://supermariomakerbookmark.nintendo.net/courses/"+courseID+"/play_at_later";
    console.log("bookmarking with token "+token);

      if (token!=0 && token!=undefined)
              GM_xmlhttpRequest({
                   method: "POST",
                   url: postURL,
                   data: "",
                   headers: {
                      "Accept": "application/json",
                      "Accept-Encoding": "gzip, deflate",
                      "Pragma": "no-cache",
                      "Referer": "https://supermariomakerbookmark.nintendo.net/bookmarks/"+courseID,
                      "Host": "supermariomakerbookmark.nintendo.net",
                      "X-CSRF-Token": token,
                      "X-Requested-With": "XMLHttpRequest",
                    },
                   onload: function(xhr) {
                      callback();
                      return 1;
                   },
                   onerror: function(xhr) {
                      alert("error: "+xhr.responseText);
                      return 0;
                   }
              });


  });
          
}

//Unbookmark a course.
function marioMakerUnbookmark(courseID,callback) {


  marioMakerGetCSRFToken(courseID, function(token){

    //make a DELETE request to https://supermariomakerbookmark.nintendo.net
    deleteURL = "https://supermariomakerbookmark.nintendo.net/bookmarks/"+courseID;

      if (token!=0 && token!=undefined)
              GM_xmlhttpRequest({
                   method: "DELETE",
                   url: deleteURL,
                   data: "",
                   headers: {
                      "Accept": "application/json",
                      "Accept-Encoding": "gzip, deflate",
                      "Pragma": "no-cache",
                      "Referer": "https://supermariomakerbookmark.nintendo.net/bookmarks/"+courseID,
                      "Host": "supermariomakerbookmark.nintendo.net",
                      "X-CSRF-Token": token,
                      "X-Requested-With": "XMLHttpRequest",
                    },
                   onload: function(xhr) {
                      callback();
                      return 1;
                   },
                   onerror: function(xhr) {
                      alert("error: "+xhr.responseText);
                      return 0;
                   }
              });
  });

}



//For a given HTML node (we created them while parsing the initial HTML document), create a pretty line with the level's name and a bookmark button.
function marioMakerCreateLink(courseHTMLNode) {

    //console.log(currentRequests);
    if(currentRequests > maxRequests) {//Too many requests right now.
        setTimeout(marioMakerCreateLink, 1000, courseHTMLNode);//wait a second then recheck
        return;
    }

    currentRequests++;
    
    var courseURL = courseHTMLNode.href;
    //console.log("Getting info for "+courseURL);
    
    //Grab the HTML page matching the course and get course info
    GM_xmlhttpRequest({
     method: "GET",
     url: courseURL,
     onload: function(xhr) {

        var result = xhr.responseText;
        
        var parsed = $('<div/>').append(result);
        
        var course = parsed.find(".course-title");
        if (course.length == 0) //does the course exist ?
            {
                courseHTMLNode.textContent = "Course deleted.";
                $(courseHTMLNode).attr('smmprocessed','true');
            }
        else //Course exists, let's get some info ! 
            {
            var courseTitle = course.text();
            var courseMaker = parsed.find(".name")[0].innerHTML;
            var courseDiffLevel = parsed.find(".course-header").text().trim().substring(1);
            var isBookmarked = parsed.find(".button.playlist.off").hasClass("disabled");
            
            console.log(parsed.find(".button .playlist .off"));

            if (courseDiffLevel == "")
                courseDiffLevel = "Unrated";

            if (isBookmarked)
            {
              //we can change the bookmarked setting of the <a> button appropriately.
              changeIconBookmark($(courseHTMLNode).next());

            }
       
            //console.log("got info: "+courseTitle+" ("+courseDiffLevel+") by "+courseMaker);
            
            courseHTMLNode.textContent = courseTitle+" ("+courseDiffLevel+") by "+courseMaker;
            $(courseHTMLNode).attr('smmprocessed','true');
            
            }
            
        //Request is done
        currentRequests--;
        
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


function replaceInElement(element, find, replace) {
    // iterate over child nodes in reverse, as replacement may increase
    // length of child node list.
    for (var i= element.childNodes.length; i-->0;) {
        var child= element.childNodes[i];

          //If we find a wbr tag, we remove it, go back and recheck.
          if (child.nodeName == "WBR") 
          {
            p = child.parentElement;
            child.parentElement.removeChild(child);
            p.normalize();
            //replaceInElement(p, find, replace);
          }
          else
            if (child.nodeType==1) { // ELEMENT_NODE
                var tag= child.nodeName.toLowerCase();
                if (tag!='style' && tag!='script' && tag!='textarea' && tag!='input' && child.hasAttribute("smmloaded") == false) // special cases, these won't be parsed
                    replaceInElement(child, find, replace);
            } else if (child.nodeType==3) { // TEXT_NODE
                replaceInText(child, find, replace);
            }
    }
}

function replaceInText(text, find, replace) {
    var match;
    var matches= [];
    while (match= find.exec(text.data))
        matches.push(match);
    for (var i= matches.length; i-->0;) {
        match= matches[i];
        text.splitText(match.index);
        text.nextSibling.splitText(match[0].length);

        //console.log(text.parentNode);

        //if there's already an <a> element leading to a SMM course on parentnode without smmloaded=true here we delete it
        if (text.parentNode.nodeName == "A" && courseRegex.test(text.parentNode.href))
          text.parentNode.parentNode.replaceChild(replace(match),text.parentNode);
          else
            if (text.parentNode.nodeName != "A")
             text.parentNode.replaceChild(replace(match), text.nextSibling);
    }
}

//Changes images and states of the bookmark button given as a parameter.
function changeIconBookmark(node) {

   $(node).find('img').attr('src',bookmarkedicon);
   $(node).find('img').attr('title',"Unbookmark this level");
   $(node).find('img').attr('alt',"Unbookmark");
   $(node).attr('bookmarkstate',1);
   $(node).find('img').hover(function(){$(this).attr('src',unbookmarkicon);}, function(){$(this).attr('src',bookmarkedicon);} );

}

function changeIconUnbookmark(node) {

  $(node).find('img').attr('src',bookmarkicon);
  $(node).find('img').attr('title',"Bookmark this level");
  $(node).find('img').attr('alt',"Bookmark");
  $(node).attr('bookmarkstate',0);
  $(node).find('img').hover(function(){$(this).attr('src',bookmarkedicon);}, function(){$(this).attr('src',bookmarkicon);} );

}


//Replaces Bookmark links with a custom link + Bookmark button.
//Also works on single level codes, for Miiverse 'n shit.
//a typical SMM Bookmark link is https://supermariomakerbookmark.nintendo.net/courses/7829-0000-0047-74F8
function marioMakerReplaceLinks() {

    window.clearTimeout(refresh);

    console.log("Analyzing links");

    //Regexing for the level code.
    replaceInElement(document.body, codeRegex, function(match) {

        var link = document.createElement('span');
        var courseID = match[0];
        //console.log(courseID);

        $(link).append('<img style="margin-right: 3px;" src="http://supermariomakerbookmark.nintendo.net/assets/favicon/favicon-6529ac1b94d398a37ceabd51acb07a94.ico" />');

        var hoverhtml = '<a smmloaded="true" href="https://supermariomakerbookmark.nintendo.net/courses/'+courseID+'">Hover for Level Info('+courseID+')</a>';
        $hoverlink = $(hoverhtml);
        $hoverlink.hover(function(){marioMakerCreateLink(this);}, function(){});

        $(link).append($hoverlink);

//var bookmarkicon = 'https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/iconbookmark.png';
//var bookmarkedicon = 'https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/iconbookmarked.png';
//var unbookmarkicon = 'https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/iconunbookmark.png';

        //Add the Bookmark link.
        var string = '<a style="text-decoration: underline; margin-left: 5px; cursor:pointer" bookmarkstate="0"><img style="height:18px" title = "Bookmark this level" alt="Bookmark" src="'+bookmarkicon+'" /></a>';
        $bookmarklink = $(string);  //if it's not a jQuery object, make it one
        $bookmarklink.find('img').hover(function(){$(this).attr('src',bookmarkedicon);}, function(){$(this).attr('src',bookmarkicon);});
        $bookmarklink.click(function(){ 
                                  bookmarkstate = $(this).attr('bookmarkstate');
                                  node = this;

                                  if (bookmarkstate == 0)
                                    marioMakerBookmark(courseID,function(){
                                      console.log("bookmarked!");
                                      changeIconBookmark(node);
                                    });

                                  if (bookmarkstate == 1)
                                    marioMakerUnbookmark(courseID,function(){
                                      console.log("unbookmarked!");
                                      changeIconUnbookmark(node);
                                    });

                                }); //add the function on click

        $(link).append($bookmarklink); //insert into DOM

        return link;

    });
    
    //We're done, set a new timeout
    refresh = setTimeout(marioMakerReplaceLinks, parseInterval);

}



console.log("Executing SMM Linkifier v1...");
var refresh = setTimeout(marioMakerReplaceLinks, 2000);

