$(document).ready(function() {

	/***************** Waypoints ******************/

	$('.wp1').waypoint(function() {
		$('.wp1').addClass('animated fadeInLeft');
	}, {
		offset: '75%'
	});
	$('.wp2').waypoint(function() {
		$('.wp2').addClass('animated fadeInDown');
	}, {
		offset: '75%'
	});
	$('.wp3').waypoint(function() {
		$('.wp3').addClass('animated bounceInDown');
	}, {
		offset: '75%'
	});
	$('.wp4').waypoint(function() {
		$('.wp4').addClass('animated fadeInDown');
	}, {
		offset: '75%'
	});

	/***************** Flickity ******************/

	$('#featuresSlider').flickity({
		cellAlign: 'left',
		contain: true,
		prevNextButtons: false
	});

	$('#showcaseSlider').flickity({
		cellAlign: 'left',
		contain: true,
		prevNextButtons: false,
		imagesLoaded: true
	});

	/***************** Fancybox ******************/

	$(".youtube-media").on("click", function(e) {
		var jWindow = $(window).width();
		if (jWindow <= 768) {
			return;
		}
		$.fancybox({
			href: this.href,
			padding: 4,
			type: "iframe",
			'href': this.href.replace(new RegExp("watch\\?v=", "i"), 'v/'),
		});
		return false;
	});

});

/***************** ColorInfo Modal ******************/

// Get the modal
var modal = document.getElementById('myModal');
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// When the user clicks on an image, open the modal 
$(document).ready(function() {
	$("a.single_image").click(GalleryImageClick);
        
 
});

function GalleryImageClick(event) {
    event.preventDefault();

    var modalTitle = $("#ci-img-name");
    modalTitle.html("Image: <strong>" + this.href.split('/').pop() + "</strong>")
    var modalImg = document.getElementById("colorInfo-img");
    modalImg.src = this.href;
    modalImg.onload = DrawColorInfoPhp;
    modal.style.display = "block";     
    //add loading icon
}

// Get Color Info and draw Swatches
var ColorInfoTable;
function DrawColorInfo() {
    var colorThief = new ColorThief();
    var average = getAverageColourAsRGB(this);
    var palletes = colorThief.getPalette(this);
    var vibrant = new Vibrant(this, 256, 4);
    var vibrantSwatches = vibrant.swatches();
    
    ColorInfoTable = [];
    
    average.hex = $c.rgb2hex(average.r, average.g, average.b);
    ColorInfoTable.push({hex: average.hex, 
                 rgb: [average.r, average.g, average.b], 
                 hsl: rgb2hsl(average.r, average.g, average.b), 
                 cmyk: rgb2cmyk([average.r, average.g, average.b])});
    
    $("#ci-average").empty();
    //$("#ci-average").append("<span>Avg:</span>");

    
    var swatch = $('<div class="swatch"><span>Avg: '+ average.hex +'</span></div>');
    swatch.css("background-color", average.hex);
    swatch.appendTo($("#ci-average"));
    
    //var mainVibrant = vibrantSwatches["Vibrant"].getHex();
    //$(".modal-header").css("background-color", mainVibrant);
    //$(".modal-footer").css("background-color", mainVibrant);
    $("#ci-vibrant").empty();
    for (var swatch in vibrantSwatches) 
    {
        if (vibrantSwatches.hasOwnProperty(swatch) && vibrantSwatches[swatch]) 
        {
            var swatchHex = vibrantSwatches[swatch].getHex();
            ColorInfoTable.push({hex: swatchHex, 
                                 rgb: vibrantSwatches[swatch].getRgb(), 
                                 hsl: vibrantSwatches[swatch].getHsl(), 
                                 cmyk: rgb2cmyk(vibrantSwatches[swatch].getRgb())});
            
            
            var swatch = $('<div class="swatch"><span>'+ swatchHex +'</span></div>');
            swatch.css("background-color", swatchHex);
            swatch.appendTo($("#ci-vibrant"));
        }
    }
       
    //remove loading icon
}

var ColorInfoTable;
function DrawColorInfoPhp() {
    
    var average = getAverageColourAsRGB(this);
    ColorInfoTable = [];

    average.hex = $c.rgb2hex(average.r, average.g, average.b);
    ColorInfoTable.push({hex: average.hex, 
                 rgb: [average.r, average.g, average.b], 
                 hsl: rgb2hsl(average.r, average.g, average.b), 
                 cmyk: rgb2cmyk([average.r, average.g, average.b])});

    $("#ci-average").empty();

    var swatch = $('<div class="swatch"></div>');
    swatch.css("background-color", average.hex);
    swatch.appendTo($("#ci-average"));
    
    $.ajax(
    {
        url: "extract.php",
        type: "GET",
        data: { imagePath: this.src },
        //cache: false,
        //contentType: false,
        //processData: false,
        complete: function ()
        {
            
        },
        success: function (data)
        {
            var percentage = [100, 95, 90, 85, 80, 75, 60, 55];
            data = $.parseJSON(data);
            
            $("#ci-vibrant").empty();
            for (var ix in data) 
            {
                var color = data[ix];
                //var percentage = ((color.percent - data[data.length-1].percent) * 100) / (data[0].percent - data[data.length-1].percent)
                //percentage = 100/(Number(ix)+1);
                                
                
                var swatchHex = "#"+color.hex;
                var swatchRgb = hex2rgb(color.hex);
                ColorInfoTable.push({hex: swatchHex, 
                                     rgb: swatchRgb, 
                                     hsl: rgb2hsl(swatchRgb[0],swatchRgb[1],swatchRgb[2]), 
                                     cmyk: rgb2cmyk(swatchRgb)});


                var swatch = $('<div class="swatch"></div>');
                swatch.css("background-color", swatchHex);
                //swatch.css("height", 50 * percentage[ix]/100 + "px");
                swatch.css("width", percentage[ix] + "%");
                swatch.appendTo($("#ci-vibrant"));
            }
        },
        error: function (data)
        {
            console.log("colorized failed");
            //$form.addClass(data.success == true ? 'is-success' : 'is-error');
            //alert('Error. Please, contact the webmaster!');
        }
    });
       
    //remove loading icon
}


// Generate Color Scheme
function generateSchemeColors(scheme) {
    $('#ci-scheme').empty();
    var colors = scheme.colors();
    for (var i in colors) {
      var c = colors[i];
      var newDiv = '<div class="swatchNoClick" style="background-color: #' + c + '"></div>';
      $('#ci-scheme').append(newDiv);
    }
}

// User click on scheme
function setScheme(btn, colorType) {
    
    $(".btn-group .btn").each(function(){
        $(this).removeClass("active");
    });
    $(btn).addClass("active");
    switch(colorType) {
        case "hex":
            $(".swatch").each(function(ix, item) { 
                item.innerHTML = "<span>"  + (ix==0 ? "Avg: " : "") + ColorInfoTable[ix].hex + "</span>"; 
            });
            break;
        case "rgb":
            $(".swatch").each(function(ix, item) { 
                var rgb = ColorInfoTable[ix].rgb; 
                item.innerHTML = "<span>"  + (ix==0 ? "Avg: " : "") + "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")</span>"; 
            });
            break;
        case "hsl":
            $(".swatch").each(function(ix, item) { 
                var hsl = ColorInfoTable[ix].hsl; 
                item.innerHTML = "<span>" + (ix==0 ? "Avg: " : "") + "hsl(" + hsl[0].toFixed(2) + ", " + hsl[1].toFixed(2) + ", " + hsl[2].toFixed(2) + ")</span>"; 
            });
            break;
        case "cmyk":
            $(".swatch").each(function(ix, item) { 
                var cmyk = ColorInfoTable[ix].cmyk; 
                item.innerHTML = "<span>" + (ix==0 ? "Avg: " : "") + "cmyk(" + cmyk.c + ", " + cmyk.m + ", " + cmyk.y + ", " + cmyk.k + ")</span>"; 
            });
            break;
    }
    
    //var scheme = new ColorScheme();
    /*
    scheme.from_hex(strRgb2hexVal($(activeSwatch).css("background-color")));
    scheme.scheme(newScheme);
    generateSchemeColors(scheme);*/
}

// rgb string to hex value (ex: rgb(255,255,255) -> fffff)

function hex2rgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r,g,b];
}

function strRgb2hexVal(rgbString) {
 rgbString = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return hex(rgbString[1]) + hex(rgbString[2]) + hex(rgbString[3]);
}
function hex(x) {
  var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}
function CMYK(c, m, y, k) {
	if (c <= 0) { c = 0; }
	if (m <= 0) { m = 0; }
	if (y <= 0) { y = 0; }
	if (k <= 0) { k = 0; }
 
	if (c > 100) { c = 100; }
	if (m > 100) { m = 100; }
	if (y > 100) { y = 100; }
	if (k > 100) { k = 100; }
 
	this.c = c;
	this.m = m;
	this.y = y;
	this.k = k;
}

function rgb2cmyk (RGB){
    var result = new CMYK(0, 0, 0, 0);

    r = RGB[0] / 255;
    g = RGB[1] / 255;
    b = RGB[2] / 255;

    result.k = Math.min( 1 - r, 1 - g, 1 - b );
    result.c = ( 1 - r - result.k ) / ( 1 - result.k );
    result.m = ( 1 - g - result.k ) / ( 1 - result.k );
    result.y = ( 1 - b - result.k ) / ( 1 - result.k );

    result.c = Math.round( result.c * 100 );
    result.m = Math.round( result.m * 100 );
    result.y = Math.round( result.y * 100 );
    result.k = Math.round( result.k * 100 );

    return result;
}

function rgb2hsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

/***************** Get Image Average Color ******************/
function getAverageColourAsRGB (img) {
  var canvas = document.createElement('canvas'),
      context = canvas.getContext && canvas.getContext('2d'),
      rgb = {r:102,g:102,b:102}, // Set a base colour as a fallback for non-compliant browsers
      pixelInterval = 5, // Rather than inspect every single pixel in the image inspect every 5th pixel
      count = 0,
      i = -4,
      data, length;

  // return the base colour for non-compliant browsers
  if (!context) { alert('Your browser does not support CANVAS'); return rgb; }

  // set the height and width of the canvas element to that of the image
  var height = canvas.height = img.naturalHeight || img.offsetHeight || img.height,
      width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;

  context.drawImage(img, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch(e) {
    // catch errors - usually due to cross domain security issues
    alert(e);
    return rgb;
  }

  data = data.data;
  length = data.length;
  while ((i += pixelInterval * 4) < length) {
    count++;
    rgb.r += data[i];
    rgb.g += data[i+1];
    rgb.b += data[i+2];
  }
  
  // floor the average values to give correct rgb values (ie: round number values)
  rgb.r = Math.floor(rgb.r/count);
  rgb.g = Math.floor(rgb.g/count);
  rgb.b = Math.floor(rgb.b/count);

  return rgb;
}

/***************** Nav Transformicon ******************/

/* When user clicks the Icon */
$(".nav-toggle").click(function() {
	$(this).toggleClass("active");
	$(".overlay-boxify").toggleClass("open");
});

/* When user clicks a link */
$(".overlay ul li a").click(function() {
	$(".nav-toggle").toggleClass("active");
	$(".overlay-boxify").toggleClass("open");
});

/* When user clicks outside */
$(".overlay").click(function() {
	$(".nav-toggle").toggleClass("active");
	$(".overlay-boxify").toggleClass("open");
});

/***************** Smooth Scrolling ******************/

$('a[href*=#]:not([href=#])').click(function() {
	if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {

		var target = $(this.hash);
		target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
		if (target.length) {
			$('html,body').animate({
				scrollTop: target.offset().top
			}, 2000);
			return false;
		}
	}
});

/****************** Create Colorized Gallery *********/
function CreateGallery(doScroll) {

    if(doScroll)
        $("#loading").modal("show");
    
    $.ajax(
    {
        url: "colorize.php",
        type: "GET",
        cache: false,
        contentType: false,
        processData: false,
        complete: function ()
        {
            if(doScroll)
                location.hash = "#examples";
            
            $("#loading").modal("hide");
            $("#uploadForm").removeClass('is-uploading');
            $("#uploadForm").removeClass('is-success');
            $("#uploadForm").removeClass('is-error');
            $("#filesInputLabel").html('<strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>');
            $("#filesInput").val("");
            
        },
        success: function (data)
        {
            data = $.parseJSON(data);
            if(data.length) {
                var galleryGrid = $("#gallery-grid");
                galleryGrid.empty();
                $.each(data, function(i, image) {
                    var figureHtml = CreateGalleryFigure(image);
                    galleryGrid.append(figureHtml);
                });

                $("a.single_image").click(GalleryImageClick);     
            }
            //$form.addClass(data.success == true ? 'is-success' : 'is-error');
            //if (!data.success)
                //$errorMsg.text(data.error);
        },
        error: function (data)
        {
            console.log("colorized failed");
            //$form.addClass(data.success == true ? 'is-success' : 'is-error');
            //alert('Error. Please, contact the webmaster!');
        }
    });  
}

function DeleteGallery() {
    $("#loading").modal("show");
    $.ajax(
    {
        url: "delete.php",
        type: "GET",
        cache: false,
        contentType: false,
        processData: false,
        complete: function ()
        {
        },
        success: function (data)
        {
            CreateGallery(false); 
        },
        error: function (data)
        {
            console.log("clear gallery failed");
        }
    });  
}

function hex2rgbaHtml(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return "rgba("+r+ ","+g+","+b+",0.95)";
}

function CreateGalleryFigure(image) {
    return [
            '<li class="gallery-thumb animated fadeInLeftBig">',
                '<figure>',
                    '<img src="'+image["path"]+'" alt="Screenshot 01">',
                    '<figcaption style="background-color:'+hex2rgbaHtml(image["hex"])+'">',
                        '<div class="caption-content">',
                            '<a href="'+image["path"]+'" class="single_image">',
                                '<i class="fa fa-search"></i><br>',
                                '<p>'+image["path"]+'</p>',
                            '</a>',
                        '</div>',
                    '</figcaption>',
                '</figure>',
            '</li>'
           ].join('\n');
}
    
$(document).ready(function(){
    
    $('#createGallery').click(function(event){ 
        event.preventDefault(); 
        CreateGallery(true); 
    });
    
    $('#deleteGallery').click(function(event){ 
        //event.preventDefault(); 
        DeleteGallery();
    });
    
    var averagingOn = false;
    $('#averaging').on('click', function(e) {
        e.preventDefault();
        $("figcaption").css("opacity", (averagingOn ? "0" : "1"));
        $(".caption-content").css("opacity", "0");
        averagingOn = !averagingOn;
    })
    
    CreateGallery(false);
});

