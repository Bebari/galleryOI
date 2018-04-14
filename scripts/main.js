var feed = new Instafeed({
    get: 'user',
    userId: 'rok.krytor30',
    filter: function(image) {
      return image.tags.indexOf('TAG_NAME') >= 0;
    }
  });
  feed.run();