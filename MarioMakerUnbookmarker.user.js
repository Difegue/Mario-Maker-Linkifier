// ==UserScript==
// @name        Mario Maker Unbookmarker
// @namespace   mml
// @description Adds some buttons that should have been there from the beginning.
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @include http://supermariomakerbookmark.nintendo.net/bookmarks*
// @include https://supermariomakerbookmark.nintendo.net/bookmarks*
// @version     0.1
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @icon         https://raw.githubusercontent.com/Difegue/Mario-Maker-Linkifier/master/icon2.png
// @updateURL    https://github.com/Difegue/Mario-Maker-Linkifier/raw/master/MarioMakerUnbookmarker.user.js
// ==/UserScript==

const codeRegex = /([a-fA-F0-9]{4}-){3}[a-fA-F0-9]{4}/g;

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
          //console.log($.parseHTML(result));
          var parsed = $('<div/>').append(result);

          //Check if the user is really logged in. Unlogged users will display the dummy mii image, which has the header-dummy-mii class.
          var isNotLoggedIn = parsed.find(".header-dummy-mii").length;

          if (isNotLoggedIn !=0) //if the class was found, we're not logged in. 
          {
            alert("Please login to the Mario Maker Bookmark website in order to bookmark levels. We're gonna open a popup for you, sit tight !");
            window.open("https://supermariomakerbookmark.nintendo.net/users/auth/nintendo");
            return 0;
          }

          var token = "";
          token = parsed.find('meta[name="csrf-token"]').attr('content');

          if (token !="") //Once we have the token, pass it to the function that needs it.
            callback(token);
          else
              {
              alert("Couldn't get token. Please make sure you're logged in to the Mario Maker Bookmark website.");
              window.open("https://supermariomakerbookmark.nintendo.net/users/auth/nintendo");
              return 0;
              }

         },
       onerror: function(xhr) {
          alert("Error while bookmarking.");
          return 0;
       }
      
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

function listClearedBookmarkedCourses()
{

  var pageNumber = $(".last").children().attr("href").split("/bookmarks?page=")[1];
  var courses = [];
  var ajaxCallsRemaining = pageNumber;

  for (var i=1; i<+pageNumber+1; i++)
  {
    var pageURL = "https://supermariomakerbookmark.nintendo.net/bookmarks?page="+i;
    console.log("parsing page with url "+pageURL);

    GM_xmlhttpRequest({
        method: "GET",
        url: pageURL,
        onload: function(xhr) {

             var result = xhr.responseText;
            
             //console.log($.parseHTML(result));
             var parsed = $('<div/>').append(result);

             parsed.find(".course-card").each(function(index){

                var courseID = $(this).find(".course-detail.link").attr("href").match(codeRegex)[0];
                var isCleared = $(this).find(".course-clear-flag-wrapper").length;

                if (isCleared !=0)
                    courses.push(courseID);

                //console.log(courseID);
                //console.log(isCleared);
                return 0;

             });

             ajaxCallsRemaining--;

             console.log(ajaxCallsRemaining+" calls remaining");

             if (ajaxCallsRemaining<=0) {
             
              var unbookmarksRemaining = courses.length;

              //Activate the unbookmarkening
              if (unbookmarksRemaining!=0)
                courses.forEach(function(entry) {

                  console.log("unbookmarking "+entry);
                        marioMakerUnbookmark(entry,function(){
                                                      unbookmarksRemaining--;
                                                      console.log(unbookmarksRemaining+" unbookmarks remaining");
                                                      if (unbookmarksRemaining<=0)
                                                        {
                                                          $("#loading-overlay").attr("style","display:none");
                                                          location.reload(); 
                                                        }
                                                      }
                                            );
                    });
              else
                $("#loading-overlay").attr("style","display:none");


              

             }
        },

        onerror: function(xhr) {
          alert("Error while bookmarking.");
          return 0;
        }


      });

  }




}


//If the user is at https://supermariomakerbookmark.nintendo.net/bookmarks, we add a link allowing him to unbookmark every course he's cleared in one click.
function marioMakerAugmentBookmarkPage()
{
  console.log("augmenting bookmark page...");

  //<a style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255); float: right; margin-top: 10px; margin-left: 0px; border-width: 10px; padding: 10px; margin-right: 10px;" class="button link">Unbookmark cleared levels</a>
  var string = '<a style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255); float: right; margin-top: 10px; margin-left: 0px; border-width: 10px; padding: 10px; margin-right: 10px;" class="button link">Unbookmark cleared levels</a>';

  var $button = $(string);
  $button.click(function(){

      if (confirm("This will unbookmark all the courses you have cleared! Are you sure?"))
        {
          //Use the website's own loader thing and start unbookmarking
          $("#loading-overlay").attr("style","display:block");
          listClearedBookmarkedCourses();

        }


      });

  $(".playlist-results").find(".playlist-top").append($button);


}


marioMakerAugmentBookmarkPage();
