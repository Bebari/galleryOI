(function bookmarklet(window) {

  var document = window.document;
  var body = document.body;

  /**
   * Sort a collection of images based on their dominant hue,
   * and show the rgb+h analysis in a nice little image alongside.
   *
   * for instance, use this bookmarklet on
   *
   *   http://www.gouletpens.com/Shop_All_Bottled_Ink_s/1106.htm?searching=Y&sort=7&cat=1106&brand=Noodler%27s&show=300&page=1
   *
   * with the query selector
   *
   *  .v65-productPhoto img
   *
   * Voila, superawesome coolness.
   *
   * - Pomax, http://twitter.com/TheRealPomax
   */

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

    var generateVisualisation = function(img) {
      // analysis graphics
      var canvas = document.createElement('canvas');
      var h = 255;
      var dim = img.huedata.red.length;
      canvas.height = h;
      canvas.width = dim;
      ctx = canvas.getContext('2d');

      // compute the RGB coordinate corresponding to the average hue
      var H = img.huedata.H,
          r = ((H < 1) ? 255           :
               (H < 2) ? (1-(H-1))*255 :
               (H < 4) ? 0             :
               (H < 5) ? (H-4)*255     : 255) | 0,
          g = ((H < 1) ? H*255         :
               (H < 3) ? 255           :
               (H < 4) ? (1-(H-3))*255 : 0) | 0,
          b = ((H < 2) ? 0             :
               (H < 3) ? (H-2)*255     :
               (H < 5) ? 255           : (1-(H-5))*255) | 0;

      ctx.fillStyle = 'rgb('+(r|0)+','+(g|0)+','+(b|0)+')';
      ctx.fillRect(0,0,dim,options.barsize);

      for(var i=0, e=(h*options.gradient)|0, s=1/e, a; i<e; i++) {
        a = (1-(i*s));
        ctx.fillStyle = 'rgba('+(r|0)+','+(g|0)+','+(b|0)+','+Math.pow(a,options.falloff)+')';
        ctx.fillRect(0,options.barsize+(i|0),dim,1);
      }

      // compute the RGB histogram
      var channels = [
        {color: 'red',   data: img.huedata.red},
        {color: 'green', data: img.huedata.green},
        {color: 'blue',  data: img.huedata.blue}
      ];
      channels.forEach(function(channel) {
        ctx.strokeStyle = channel.color;
        ctx.beginPath();
        channel.data.forEach(function(v,i) {
          ctx.moveTo(i,h);
          ctx.lineTo(i,h-v);
        });
        ctx.stroke();
        ctx.closePath();
      });

      // store the analysis on the image
      var dataURL = canvas.toDataURL('image/png');
      var viz = document.createElement('img');
      viz.src = dataURL;
      viz.width  = img.width/2;
      viz.height = img.height;
      viz.style.background = options.background;
      var nf = 1000,
          Ha = ((nf*img.huedata.H)|0)/nf,
          Ca = ((nf*img.huedata.C)|0)/nf;
      viz.setAttribute('data-hue',    Ha);
      viz.setAttribute('data-chroma', Ca);
      if(Ca < options.chromacutoff) {
        img.huedata.canvas.setAttribute('data-neutral','neutral');
        viz.setAttribute('data-neutral','neutral');
      }
      viz.setAttribute('data-rgb', r+','+g+','+b);
      img.huedata.viz = viz;
    };

    // find all images
    var imgs = Array.prototype.slice.call(document.querySelectorAll(qs));

    // process all images
    imgs.forEach(function(img) {
      img.huedata = getHue(img);
      generateVisualisation(img);
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

  // ask the user for a query selector, and then run
  var qs = prompt('Image query selector?');
  if(!qs) { console.log('No query selector specified'); }
  else {
    var imgs = rgbanalyse(qs, { xoffset: 0.5, width: 0.5 });
    var setStyle = function(e, style) {
      Object.keys(style).forEach(function(name) {
        e.style[name] = style[name];
      });
    };

    var addHeader = function(e, title) {
      var head = document.createElement('h1');
      head.textContent = title;
      head.style.margin = '1em 0';
      head.style.fontSize = '300%';
      head.style.fontVariant = 'small-caps';
      e.appendChild(head);
    };

    var overlay = document.createElement('div');
    setStyle(overlay, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0,0,0,0.4)',
      zIndex: 9998,
      overflow: 'hidden'
    });
    body.appendChild(overlay);

    content = document.createElement('div');
    setStyle(content, {
      position: 'fixed',
      top: '2em',
      left: '2em',
      right: '2em',
      bottom: '2em',
      background: 'white',
      zIndex: 9999,
      overflowX: 'hidden',
      overflowY: 'scroll',
      padding: '0 2em',
      textAlign: 'left'
    });
    overlay.appendChild(content);
    addHeader(content, 'colours');

    var b = getComputedStyle(document.body);
    var scroll = {
      x: b.getPropertyValue('overflow-x'),
      y: b.getPropertyValue('overflow-y')
    };

    body.style.overflowX = 'hidden';
    body.style.overflowY = 'hidden';

    imgs.forEach(function(img) {
      var data = img.huedata;
      content.appendChild(data.canvas);
      content.appendChild(data.viz);
    });

    imgs = Array.prototype.slice.call(document.querySelectorAll('*[data-neutral]'));
    if(imgs.length > 0) {
      addHeader(content, 'darks, greys, whites (neutrals)');
      imgs.forEach(function(e) {
        content.appendChild(e);
      });
    }

    overlay.onclick = content.onclick = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      body.removeChild(overlay);
      body.style.overflowX = scroll.x;
      body.style.overflowY = scroll.y;
      return false;
    };
  }

}(this));
