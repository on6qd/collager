/*
$('.a-glossify-image-container').glossyPhotos({images:[{image:'%s',width:%s,height:%s},{image:'%s',width:%s,height:%s}...],useOuterSize:false});




build 2014-07-07: removed responsive resizing logic
build 2014-07-21: created new responsive resizing logic
build 2014-07-28: implemented responsive logic as callback function
 - integrated default: "screenHeightResponsive" - default responsive logic
 - integrated default: "defaultResponsive" - default responsive logic
 - integrated: "notresponsive" - no automatic responsive resizing

*/

var glossyPhotos = (function () {
    /*
    The GlossyPhotos helper functions
    */
    var _makerResponsive = function (div,image,scaleDivHeight) {
        
        var newImage = {},
            screenWidth = window.screen.width,
            screenHeight = window.screen.height,
            documentWidth = document.body.clientWidth,
            divWidth=div.outerWidth(),
            divHeight=div.outerHeight(),
            finaleScale=1;

        if (screenWidth < screenHeight) {
            screenWidth =  window.screen.height;
            screenHeight = window.screen.width;
        }
        
        if (screenWidth > glossyPhotos.maxScreenWidth) {
            finaleScale=glossyPhotos.maxScreenWidth/screenWidth;
        }
            
        
        var aspect= image.width/image.height,
            scale = screenWidth / $(window).width(); 
            maxWidth =Math.ceil(divWidth * scale / 100) * 100,
            maxHeight = maxWidth / aspect;
        
        if (scaleDivHeight === 'default') {
            if (maxHeight<divHeight) {
                var scaleUp = divHeight / maxHeight;  
                maxHeight = divHeight;
                maxWidth=maxWidth * scaleUp;
            }
        }

        if (scaleDivHeight === 'screenHeight') {
            scale = screenHeight / $(window).height(); 
           
            if (maxHeight < (divHeight * scale) ) {
                var scaleUp = divHeight * scale / maxHeight;  
                maxHeight = divHeight * scale;
                maxWidth=maxWidth * scaleUp;
            }
        }

        if (scaleDivHeight === 'fullScreen') {
            maxHeight = screenHeight;
            maxWidth=screenWidth;
        }
        
        maxWidth=Math.ceil(maxWidth*finaleScale);
        maxHeight=Math.ceil(maxHeight*finaleScale);

        /*
        apply rounding
        */
        aspect=Math.round(maxWidth / maxHeight *10)/10
        
        if ( aspect < 1 ) {
            maxHeight = Math.ceil (maxHeight/100)*100;
            maxWidth = Math.ceil(maxHeight / aspect);
        } else {
            maxWidth = Math.ceil (maxWidth/100)*100;
            maxHeight = Math.ceil(maxWidth / aspect);
            
        }
        
        
        var responsiveImage = image.image,
            originalSizeString ='/' + image.width + 'x',
            newSizeString='/' + maxWidth + 'x';  
         
        responsiveImage = responsiveImage.replace(originalSizeString,newSizeString);
        
        originalSizeString ='x' + image.height + '/',
        newSizeString='x' + maxHeight + '/';  

        responsiveImage = responsiveImage.replace(originalSizeString,newSizeString);
        
        newImage.image=responsiveImage;
        newImage.width=maxWidth;
        newImage.height=maxHeight;
        
        return newImage; 
    }

    return {
        preventResize : false,
        maxScreenWidth : 1600,
        notResponsive : function (div,image) {
            return image            
        },

        defaultResponsive : function (div,image) {
            return _makerResponsive(div,image,'default')
        },

        screenHeightResponsive : function (div,image) {
            return _makerResponsive(div,image,'screenHeight')
        },
        fullScreenResponsive : function (div,image) {
            return _makerResponsive(div,image,'fullScreen')
        }
    }
})();


(function($){


    
    

    var calculate = function(div,image){
        var returnval = new Array();
        if (settings.useOuterSize){
            width=div.outerWidth();
            height=div.outerHeight();
        } else {
            width=div.width();
            height=div.height();
        };
        aspectRatio=image.width/image.height;
        if ((width / height) < (aspectRatio) ) {
            returnval.height=height;
            returnval.width=height * aspectRatio;
            returnval.left=-(height * aspectRatio / 2)+(width/2)+'px';
            returnval.top='0px';
        } else {
            returnval.height=width / aspectRatio;
            returnval.width=width;
            returnval.top=-(width / aspectRatio / 2)+(height/2)+'px';
            returnval.left='0px';
        };
        return returnval;
    }

    var repaint = function() {
        if (!glossyPhotos.preventResize){
            $('.glossify-image').each(function(){
                metrics=calculate($(this).parent('div'),this);
                $(this).css('width',metrics.width);
                $(this).css('height',metrics.height);
                $(this).css('top',metrics.top);
                $(this).css('left',metrics.left);

            });
            $('.glossify-overlay').each(function(){
                var image={};
                image.width=parseInt($(this).css('width'), 10);
                image.height=parseInt($(this).css('height'),10);
                metrics=calculate($(this).parent('div'),image);
                $(this).css('width',metrics.width);
                $(this).css('height',metrics.height);
                $(this).css('top',metrics.top);
                $(this).css('left',metrics.left);

            });
        }
    }
    $( window ).on('resize',function() {
        repaint();
    });
    $( window ).on('orientationchange',function() {
        repaint();
    });

    var initialSettings={scaleDivHeight:'none'};
    var settings={};

    $.fn.glossyPhotos = function(options){

        if (typeof options.repaint !== 'undefined') {
            repaint();
            return this;
        }
     
        settings = $.extend(initialSettings, options );

        var i=0;
        this.filter( "div" ).each(function(){
            if ($(this).find("img.glossify-image").length === 0){
                if (typeof settings.images[i] !== 'undefined'){
                    
                    if(typeof settings.responsiveFunction === 'function'){
                        responsiveFunction=settings.responsiveFunction;
                    } else {
                        responsiveFunction = glossyPhotos.defaultResponsive;
                    }
                    settings.images[i] = responsiveFunction.call(undefined,$(this),settings.images[i]);
                    metrics=calculate($(this),settings.images[i]);
                    content=this.innerHTML;
                    image='<img class="glossify-image" src="'+settings.images[i].image+'"style="position:absolute;top:'+metrics.top+';left:'+metrics.left+';width:'+metrics.width+'px;height:'+metrics.height+'px;"/>';
                    this.innerHTML=image+'<div class="glossyimage-internal-content-wrapper" style="position:relative">'+content+'</div>';
                    ++i;
                }
            }
        });
        return this;
    };

    $.fn.glossyOverlay = function(options){
        var i=0;
        return this.filter( "div" ).each(function(){
            if ($(this).find("div.glossify-overlay").length === 0){
                if (typeof settings.images[i] !== 'undefined'){
                    if (typeof options.overlays[i] !== 'undefined' && options.overlays[i].overlay){
                        metrics=calculate($(this),settings.images[i]);
                        content=this.innerHTML;
                        overlay='<div class="glossify-overlay" style="position:absolute;top:0px;width:'+metrics.width+'px;height:'+metrics.height+'px;top:'+metrics.top+';left:'+metrics.left+';"/>'+options.overlays[i].overlay+'</div>';
                        this.innerHTML=content+overlay;
                    }
                    ++i;

                }
            }
        });
        return this;
    };

})(jQuery);



