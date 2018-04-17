(function() {
    document.addEventListener('DOMContentLoaded', function() {

      var imageColorArray = rgbanalyse(".vibrant", { xoffset: 0.5, width: 0.5 }); //sort by hue

      /*imageColorArray.sort(function (a, b) {
          return a[1][0] - b[1][0];
      });*/
      var colorThief = new ColorThief();
      var imagesHtml = '';

      imageColorArray.forEach(function(img) {
          //var color = getAverageColourAsRGB(img);

          var average = getAverageColourAsRGB(img);
          var dominant = new ColorThief().getColor(img);
          var palletes = colorThief.getPalette(img);
          var vibrant = new Vibrant(img);
          var vibrantSwatches = vibrant.swatches();
          var vibBorder = "";
          if(vibrantSwatches.Vibrant)
            var vibBorder = vibrantSwatches.Vibrant.getRgb();

          
          var dominantBg = "background-color:rgb(" + Math.round(dominant[0]) + ", " + Math.round(dominant[1]) + "," + Math.round(dominant[2]) + ")";
          var averageBg = "background-color:rgb(" + Math.round(average.r) + ", " + Math.round(average.g) + "," + Math.round(average.b) + ")";
          var vibrantBorder = "border-color: rgb(" + Math.round(vibBorder[0]) + ", " + Math.round(vibBorder[1]) + "," + Math.round(vibBorder[2]) + ")";
          //var rgbColor = hsvToRgb(el[1][0], el[1][1], el[1][2]);
          //var styleBg = "background-color:rgb(" + Math.round(rgbColor[0]) + ", " + Math.round(rgbColor[1]) + "," + Math.round(rgbColor[2]) + ")";
          imagesHtml += '<div class="wrapper">';
          imagesHtml += '<div class="container" >\n\
                              <img style="'+vibrantBorder+'" src="' + img.currentSrc + '">\n\
                         </div>'; 

          //dominant color
          
          imagesHtml += '<span>Average:</span><div class="average" style="'+ averageBg + '"></div>';
          imagesHtml += '<span>Dominant:</span><div class="dominant" style="'+ dominantBg + '"></div>';

          //swatches (vibrant, etc..)
          imagesHtml += '<span>Vibrant:</span><div class="vibrant">';
          for (var swatch in vibrantSwatches) 
          {
              if (vibrantSwatches.hasOwnProperty(swatch) && vibrantSwatches[swatch]) 
              {
                  var swatchRgb = vibrantSwatches[swatch].getRgb();
                  var swatchBg = "background-color:rgb(" + Math.round(swatchRgb[0]) + ", " + Math.round(swatchRgb[1]) + "," + Math.round(swatchRgb[2]) + ")";
                  imagesHtml += '<div style="'+swatchBg+'" class="vibrant-swatch"></div>';
              }
          }
          imagesHtml += '</div>';
          
          //color pallete
          imagesHtml += '<span>Pallete:</span><div class="palletes">';
          palletes.slice(0,5).forEach(function(pallete) {
              var palBg = "background-color:rgb(" + Math.round(pallete[0]) + ", " + Math.round(pallete[1]) + "," + Math.round(pallete[2]) + ")";
              imagesHtml += '<div class="pallete" style="'+palBg+'"></div>';
          });
          
          imagesHtml += '</div>';
          imagesHtml += '</div>';

      });
      document.getElementById("loadedImages").style = "display:none;";
      document.getElementById("colorified").innerHTML = imagesHtml;
    });
}).call(this);

function InstgramMediaPopup(elem, mediaUrl) {
    
    var embedUrl = 'https://api.instagram.com/oembed/?hidecaption=true&maxwidth=625&omitscript=true&url=';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", embedUrl+mediaUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    
    var blockQuote = xmlHttp.responseText;
    var parsed = JSON.parse(blockQuote)
    $.fancybox.open( '<div id="insta-wrapper">' + parsed.html + '</div>' );
    $("#insta-wrapper").width(parsed.width + "px");
    instgrm.Embeds.process()
}

function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}

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
  
  
  var defaults = {
    // these values effect cropping, and are
    // in dimension-ratio. E.g. x=0.5 is width/2
    xoffset: 0,
    yoffset: 0,
    width  : 1,
    height : 1,
    // these values effect perceptual correction
    cr: 1,
    cg: 1,
    cb: 1,
    // how high a solid 'hue' bar before gradient falldown
    barsize: 20,
    // how strong a gradient
    gradient: 0.2,
    // how fast a falloff
    falloff: 3,
    // which hue step ([0..6]) to treat as 'first'
    hueshift: 1,
    // below which chroma value is something hue-less?
    chromacutoff: 0.07,
    // histogram background color
    background: 'transparent'
  }; 
  
 function rgbanalyse(qs, options) {
    options = options || window.RGBAnalyseOptions || {};

    Object.keys(defaults).forEach(function(key) {
      options[key] = options[key] || defaults[key];
    });

    var π = Math.PI, τ = 2*π;

    var getHue = function(img) {
      // place the image for processing
      var canvas = document.createElement('canvas');
      canvas.width = img.width * options.width;
      canvas.height = img.height * options.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img,-img.width*options.xoffset,-img.height*options.yoffset);

      // iterate over all pixels
      var r,g,b,i,last,ra=0,ga=0,ba=0;
      var dim = 255;
      var red   = (new Array(255)).join('.').split('.').map(function(){return 0;});
      var green = red.slice();
      var blue  = red.slice();
      var data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
      var len = data.length;
      for(i=0; i<len; i+=4) {
        r = data[i];
        g = data[i+1];
        b = data[i+2];
        a = data[i+3];
        red[r]++;
        green[g]++;
        blue[b]++;
        ra += r;
        ga += g;
        ba += b;
      };

      ra = options.cr * ra;
      ga = options.cg * ga;
      ba = options.cb * ba;

      var result = {
            canvas: canvas,
            red: red,
            ra: ra,
            green: green,
            ga: ga,
            blue: blue,
            ba:ba
          },
          R,G,B,
          M = Math.max(ra,Math.max(ga,ba));

      R = ra / M;
      G = ga / M;
      B = ba / M;

      result.R = R;
      result.G = G;
      result.B = B;

      var α = (R - G/2 - B/2),
          β = Math.sqrt(0.75) * (G - B),
          H2 = Math.atan2(β, α),
          C2 = Math.sqrt(α*α + β*β);

      result.α = α;
      result.β = β;
      result.H = (H2 + τ) % τ;
      result.C = C2 * 10/π;

      return result;
    };

    // find all images
    var imgs = Array.prototype.slice.call(document.querySelectorAll(qs));

    // process all images
    imgs.forEach(function(img) {
      img.huedata = getHue(img);
      //generateVisualisation(img);
    });

    // sort images by hue
    imgs.sort(function(a,b) {
      a = (a.huedata.H + options.hueshift) % 6;
      b = (b.huedata.H + options.hueshift) % 6;
      return a - b;
    });

    // return processed, sorted list
    return imgs;
  };