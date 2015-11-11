var pathRoot = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':'+window.location.port : '') + window.location.pathname;
var href = location.href.split('/');
href.pop();
var adPathRoot = href.join('/') + '/';
var titleRoot = document.title;
var body = document.body, html = document.documentElement;
var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
var current = '';
var swapped = false;
var adsloaded = [];
/* THIS IS CONFIG DATA SPECIFIC TO SITE */
var showAds = true; //show slide-up leaderboards at bottom
var slideAds = 1; //number of times to slide up a leaderboard
var titleFade = true; //whether to fade the Denver Post logo in the top-bar to show the "DP" and a text title

function revealSocial(type,link,title,image,desc,twvia,twrel) {
    title = typeof title !== 'undefined' ? title : false;
    image = typeof image !== 'undefined' ? image : false;
    desc = typeof desc !== 'undefined' ? desc : false;
    twvia = typeof twvia !== 'undefined' ? twvia.toString().replace('@','') : false;
    twrel = typeof twrel !== 'undefined' ? twrel.toString().replace('@','') : false;
    //type can be twitter, facebook or gplus
    var srcurl = '';
    if (type == 'twitter') {
        srcurl = 'http://twitter.com/intent/tweet?text=' + encodeURIComponent(title).replace('|','%7c') + '&url=' + link + '&via=' + twvia + '&related=' + twrel;
    } else if (type == 'facebook') {
        srcurl = 'http://www.facebook.com/sharer/sharer.php?s=100&p[url]=' + link + '&p[images][0]=' + image + '&p[title]=' + encodeURIComponent(title).replace('|','%7c') + '&p[summary]=' + encodeURIComponent(desc).replace('|','%7c');
    } else if (type == 'gplus') {
        srcurl = 'https://plus.google.com/share?url=' + link;
    }
    console.log(srcurl);
    if (srcurl.length > 1) {
        window.open(srcurl, type, 'left=60,top=60,width=500,height=500,toolbar=1,resizable=1').focus();
    }
    return false;
}

$(document).foundation('reveal', {
    animation: 'fade',
    animationspeed: 200
});

function revealCredits() {
    $('#credits').foundation('reveal', 'open');
}
function checkHash() {
    if (window.location.hash) {
        var hash = window.location.hash;
        scrollDownTo(hash);
    }
}

function scrollDownTo(whereToScroll, scrollOffset) {
    scrollOffset = typeof scrollOffset !== 'undefined' ? scrollOffset : 60;
    if ($(whereToScroll).length) {
        $('html,body').animate({
            scrollTop: ($(whereToScroll).offset().top - scrollOffset)
        }, 300);
    }
}

function playerCreator(embedId, playerId, divId) {
    divId = typeof divId !== 'undefined' ? divId : false;
    if (divId) {
        $(divId).animate({backgroundColor:'rgba(0,70,70,0.3)',paddingLeft:'.5em',paddingRight:'.5em'}, 350).delay(2000).animate({backgroundColor:'transparent',paddingLeft:'0',paddingRight:'0'},1000);
    }
    OO.Player.create(embedId, playerId, {autoplay:true});
}

function playerScroller(embedId, playerId, divId) {
    scrollDownTo(('#' + embedId),100);
    playerCreator(embedId, playerId, divId);
}
function getNodePosition(node) {
    var eTop = $(node).offset().top;
    return Math.abs(eTop - $(window).scrollTop());
}
function isVisible(element) {
    var vidTop = $(element).offset().top;
    var vidBot = $(element).offset().top + $(element).height();
    var fromTop = $(window).scrollTop() + $(element).height() / 2;
    if ( fromTop > vidTop && fromTop < vidBot ) {
        return true;
    } else {
        return false;
    }
}

function isElementInViewport(el) {
    el = el.toString().replace('#','');
    if (document.getElementById(el) != null) {
        var rect = document.getElementById(el).getBoundingClientRect();
        var half = window.innerHeight / 2;
        var whole = window.innerHeight;
        return ( (rect.top > 0 && rect.top < half) || (rect.bottom < whole && rect.bottom > half) || (rect.top < 0 && rect.bottom > whole) );
    } else {
        return;
    }
}

$('.top-top').click(function(evt) {
    $('.toggle-topbar').click();
});

$('.vid-embed').on("mouseenter", function() {
    $(this).find('.playicon').fadeTo(300, 0);
    $(this).find('.playtext').fadeTo(300, 1);
});
$('.vid-embed').on("mouseleave", function() {
    $(this).find('.playicon').fadeTo(300, 1);
    $(this).find('.playtext').fadeTo(300, 0);
});

function fadeNavBar(reverse) {
    if (reverse) {
        $('#name1').animate({opacity:1},500);
        $('#name2').animate({opacity:0},500);
        titleFade = true;
    } else {
        $('#name1').animate({opacity:0},500);
        $('#name2').animate({opacity:1},500);
        titleFade = false;
    }
}

function checkFade() {
    if ( !($(window).scrollTop() < window.innerHeight) && titleFade ) {
        fadeNavBar(false);
    } else if ( ($(window).scrollTop() < window.innerHeight) && !titleFade) {
        fadeNavBar(true);
    }
}

function hideAdManual() {
    $('#adwrapper').fadeOut(300);
    $('#adwrapper a.boxclose').css('display', 'none');
    $('#footer-bar').delay(150).animate({marginBottom:'0'},300);
    $('#adframewrapper').html('');
    swapped = false;
}

$(document).keyup(function(e) {
    if (swapped && e.keyCode == 27) {
        hideAdManual();
    } else if ( $('.gridbox.expanded').length ) {
        $('.gridbox').each(function() {
            if ( $(this).hasClass('expanded') ) {
                swapGridBox(this);
            }
        });    
    }
});

function getAdSize() {
    if ( $(window).width() >= 740 ) {
        var adSizes = ['ad=medium','728','90'];
        return adSizes;
    } else {
        return false;
    }
}

/* grid stuff */

var gridOpen = false;

function swapGridBox(box) {
    if ( !$(box).hasClass('expanded') ) {
        $(box).parent('li').siblings().css('display','none');
        $(box).parents('ul').removeClass('large-block-grid-3');
        $(box).parents('ul').removeClass('medium-block-grid-3');
        $(box).parents('ul').removeClass('small-block-grid-1');
        $(box).find('p.gridcaption').css('display','none');
        $('#topblurb').css('display','none');
        $(box).closest('ul').siblings('.gridcentersmall').css({overflow:'hidden',height:'0px'});
        $(box).find('.gridphotograd').css('display','block');
        $(box).addClass('expanded');
        $(box).removeClass('clickable');
        scrollDownTo('#profiles');
        $('body').css('background-color','rgba(0,0,0,0.7)');
        playerClear = false;
        gridOpen = true;
    } else if (!playerClear) {
        $(box).parent('li').siblings().css('display','block');
        $(box).parents('ul').addClass('large-block-grid-3');
        $(box).parents('ul').addClass('medium-block-grid-3');
        $(box).parents('ul').addClass('small-block-grid-1');
        $(box).find('p.gridcaption').css('display','block');
        $('#topblurb').css('display','block');
        $(box).closest('ul').siblings('.gridcentersmall').css({overflow:'hidden',height:'auto'});
        $(box).find('.gridphotograd').css('display','none');
        $(box).removeClass('expanded');
        $(box).addClass('clickable');
        scrollDownTo('#profiles');
        $('body').css('background-color','rgba(255,255,255,1)');
        playerClear = false;
        gridOpen = false;
    }
}

$('.gridbox.clickable').on("click", function(e) {
    if (!gridOpen && e.target == this) {
        swapGridBox(this);
    }
});

$('.gridbox.expanded').on("click", function(e) {
    if (gridOpen && e.target == this) {
        swapGridBox(this);
    }
});

$('.boxclose').on("click", function(e) {
    var parent = $(this).closest('.gridbox');
    if (gridOpen && $(parent).hasClass('expanded') ) {
        swapGridBox(parent);
    }
});

$(document).mouseup(function(e) {
    if (gridOpen) {
        var container = $('.gridbox.expanded');
        var adWrap = $('#adwrapper');
        var video = $('.gridbox.expanded .inset-video-center');
        if (!adWrap.is(e.target) && adWrap.has(e.target).length === 0
            && !container.is(e.target) && container.has(e.target).length === 0
            && !video.is(e.target) && video.has(e.target).length === 0)
        {
            swapGridBox(container);
        }
    }
});

$('.gridprofile').scroll(function(){
    $(this).siblings('.gridphotograd').animate({opacity:'0'},700);
});

function showAd() {
    var adSize = getAdSize();
    if (adSize) {
        $('#adframewrapper').html('<iframe src="' + adPathRoot + 'ad.html?' + adSize[0] + '" seamless height="' + adSize[2] + '" width="' + adSize[1] + '" frameborder="0"></iframe>');
        $('#adwrapper').fadeIn(400);
        $('a.boxclose').fadeIn(400);
        var adH = $('#adwrapper').height();
        $('#footer-bar').css('margin-bottom',adH);
        swapped = true;
    }
}

function swapAd() {
    if (swapped) {
        hideAdManual();
    }
    if (!swapped) {
        showAd();
    }
}

function getAdTimes(numAds) {
    var adReturns = [];
    var chunkHeight = docHeight / numAds;
    var chunkHalf = chunkHeight / 2;
    for (i=0;i<numAds;i++) {
        adReturns.push( Math.round( chunkHalf + (chunkHeight * i) ) );
    }
    return adReturns;
}

function checkAdPos() {
    if (showAds) {
        var topNow = $(window).scrollTop();
        if (!swapped) {
            var adTimes = getAdTimes(slideAds);
            for (i = 0; i < adTimes.length; i++) {
                if (!adsloaded[i] && topNow > adTimes[i] && topNow < (typeof adTimes[(i+1)] !== 'undefined' ? adTimes[(i+1)] : docHeight)) {
                    swapAd();
                    adsloaded[i] = true;
                    break;
                }
            }
        }
    }
}

function fontSizeNames(className,divisor) {
    $(className).each(function(){
        var maxHeight = parseInt( $(this).height() / divisor );
        $(this).textfill({
            innerTag: 'p.gridcaption',
            minFontPixels: 30,
            maxFontPixels: maxHeight
        });
    });
}

function checkFonts() {
    fontSizeNames('.gridbox',2.05);
    fontSizeNames('.gridcenter',1.2);
}

$(document).ready(function() {
    checkHash();
    checkAdPos();
    checkFonts();
});

var didScroll = false;

$(window).scroll(function() {
    didScroll = true;    
});

$(window).resize(function() {
    checkFonts();
});

setInterval(function() {
    if ( didScroll ) {
        checkAdPos();
        //checkFade();
        didScroll = false;
    }
},250);