function addCss() {
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = '
        @font-face {
            font-family: 'SMM_Font';
            src: url(data:font/woff;base64,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) format('woff');
            font-weight: normal;
            font-style: normal;
        }

        .hoverPanel {
            z-index:10000;position:fixed;color:black;background-color:#F9DB00;width:480px;min-height:250px;max-height:280px;
            font-family:'SMM_Font', Fallback ,Helvetica,Arial;padding-bottom:9px;
            border-top-left-radius:10px;
            border-top-right-radius:10px;
            border-bottom-left-radius:10px;
            border-bottom-right-radius:10px;
            } 
        .panelTop {
            height:186px;
            border-top-left-radius:10px;
            border-top-right-radius:10px;
            }
        .panelThumb {
            width:248px;height:186px;
            }
        .thumbContainer {
            position:absolute;
            }
        .thumbContainer {
            padding-left:4px;padding-top:4px;margin-bottom:9px;
            }
        .courseBanner {
            padding:6px;background-color:gray;color:white;text-align:right;font-size:20px;
            border-top-left-radius:10px;
            border-top-right-radius:10px;
            }
        .courseStats {
            margin-left:256px;font-size:14px;
            }
        .courseStat {
            color:#C19C00
            }
        .courseClearFlag {
            background-color:#F9DB00 !important;
            margin-right:14px !important;
            }
        .courseStatBlock {
            margin-bottom:4px;
            background-color: #F9CF00;
            border-radius: 3px 3px 3px 3px;
            padding: 5px;
            display: inline-block;
            }
        .panelMsg {
            padding-left:4px;padding-right:4px;font-size:25px;padding-top:13px
            }
        .panelMaker {
            padding-left:4px;padding-right:4px;
            color: #C19C00;
        }
        .fetchPanel .panelMsg {
            color:gray;font-style:italic;
            }
        .panelGreen .courseBanner {
            background-color:#28AD8A
            }
        .panelBlue .courseBanner {
            background-color:#2691BC
            }
        .panelPink .courseBanner {
            background-color:#EA348B
            }
        .panelRed .courseBanner {
            background-color:#FF4545
            }
        .panelOrange .courseBanner {
            background-color:#F0C800
            }

        .fclear {
            clear:both;
            }
        .fleft {
            float:left;
            }
        .fright {
            float:right;margin-right:40px;
            }
        .frightTag {
            text-align:center;
            margin-right:20px;
            width:70px;
            height:29px;
            };';
    document.head.appendChild(style);
  }


function buildPopup(courseID,courseName,levelDiff,clearPercent,clears,clearedByPlayer,starCount,playerCount,tag,makerName) {

    var bannerCol;

    switch (levelDiff) {
    case "Easy":
        bannerCol = panelGreen;
        break;
    case "Normal":
        bannerCol = panelBlue;
        break;
    case "Expert":
        bannerCol = panelPink;
        break;
    case "Super Expert":
        bannerCol = panelRed;
        break;
    default:
        bannerCol = panelOrange;
        break;
    }

    var HTML =  '
    <div id="'+courseID+'" class="hoverPanel '+bannerCol+'" style="left: 254px; top: 453px;">

        <div class="panelTop">
            <div class="thumbContainer">
                <img class="panelThumb" alt="'+courseID+'" src="https://dypqnhofrd2x2.cloudfront.net/'+courseID+'.jpg">
            </div>

            <div class="courseBanner">"'+levelDiff+'" - "'+clearPercent+'"</div>
            <div class="courseStats">
                
                <div class="courseStatBlock fleft" style="width: 200px; font-size: 20px; height: 29px;  margin-top: 4px;">
                    <div style="display:inline-block; margin-top: 4px;">Clears</div>
                    <div class="courseStat courseClears" style="display:inline-block; font-size: 20px">"'+clears+'"</div>
                </div>

                

                <div class="fclear"></div>

                <div class="courseStatBlock fleft" style="font-size: 25px; width: 100px">
                    <div style="display:inline-block; height: 25px; vertical-align: top; width: 25px;">
                        <svg viewBox="0 0 40.9 40" xmlns="http://www.w3.org/2000/svg">
                            <path d="M40.8 15.1c-.4-1.2-1.5-1.9-2.7-1.9H26.9L23.2 1.9C22.8.8 21.7 0 20.5 0c-1.2 0-2.3.8-2.7 1.9L14 13.1H2.8c-1.2 0-2.3.8-2.7 1.9-.4 1.2 0 2.4 1 3.2l8.9 6.7-3.4 11.4c-.4 1.2.1 2.4 1.1 3.1 1 .7 2.3.7 3.3 0l9.5-6.8 9.6 6.9c.5.4 1.1.5 1.7.5.6 0 1.2-.2 1.7-.5 1-.7 1.4-2 1.1-3.1L30.9 25l8.9-6.7c1-.8 1.4-2.1 1-3.2z" fill="#000000"/>
                        </svg> 
                    </div>

                    <div class="courseStat courseStars" style="display:inline-block">
                        '+starCount+'
                    </div>
                </div>

                <div class="courseStatBlock fright frightTag">
                        Tag
                        <div class="courseStat courseTag">'+tag+'</div>
                </div>

                ';


    if (clearedByPlayer)
        HTML += '<div style="position:absolute; top:35px;right:0px">
                     <img src="http://a.pomf.cat/jzojsx.png"/>
                </div>';


        HTML += '<div class="courseStatBlock fleft" style="font-size: 25px; width: 100px">
                    <div style="display:inline-block; height: 25px; vertical-align: top; width: 25px;">
                        <svg viewBox="0 0 47.4 40" xmlns="http://www.w3.org/2000/svg">
                        <g fill="#000000"><path d="M16.7 39.9c-3.7.7-7.1-2.1-8.9-8.2C5.4 23.6 3.3 21 2.9 16S12 3.8 17.6 7.2s1.1 12.1.6 14.2c-.7 3.3 0 4.5 1.8 7.8 2.6 4.7 1 9.8-3.3 10.7z"/><circle r="3" cy="3" cx="17.7"/><circle r="2.1" cy="3.8" cx="11.1"/><circle r="1.8" cy="5.9" cx="6.7"/><circle r="1.6" cy="8.9" cx="3.5"/><circle r="1.4" cy="12.4" cx="1.4"/><path d="M30.7 39.9c3.7.7 7.1-2.1 8.9-8.2 2.4-8.1 4.5-10.7 5-15.7S35.5 3.8 29.9 7.1s-1.1 12.1-.6 14.2c.7 3.3 0 4.5-1.8 7.8-2.6 4.7-1 9.9 3.2 10.8z"/><circle r="3" cy="3" cx="29.7"/><circle r="2.1" cy="3.8" cx="36.3"/><circle r="1.8" cy="5.9" cx="40.8"/><circle r="1.6" cy="8.9" cx="44"/><circle r="1.4" cy="12.3" cx="46.1"/></g>
                        </svg>
                    </div>

                    <div class="courseStat coursePlayers" style="display:inline-block">
                        '+playerCount+'
                    </div>
                </div>

            </div>
        </div>

        <div class="panelBottom">
            <div class="panelMsg">'+courseName+'</div>
            <div class="panelMaker">Made by '+makerName+'</div>
        </div>
    </div>';

    return HTML;
}