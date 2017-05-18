//MADE WITH HELP OF A TUTORIAL: https://coligo.io/create-url-shortener-with-node-express-mongo/

var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    base58 = require("./js/base58"),
    validUrl = require('valid-url'),
    Url = require('./models/url');

var handlebars = require('express-handlebars').create({ defaultLayout: null });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

mongoose.connect("mongodb://ens0:23Stratoir2501@ds143151.mlab.com:43151/url_shortener");

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/new/*", function(req, res) {
    var answer = {};
    var longUrl = req.path.slice(5);
    var shortUrl = '';
    if (validUrl.isUri(longUrl)){
        answer.long_url = longUrl;
        Url.findOne({long_url: longUrl}, function (err, doc){
            if(err) return err;
            if (doc){
                shortUrl = "https://" + res.req.headers.host + "/" + base58.encode(doc._id);
                answer.short_url = shortUrl;
                res.send(answer);
            } else {
              var newUrl = Url({
                long_url: longUrl
              });
              
              newUrl.save(function(err) {
                if (err){
                  console.log(err);
                }
                shortUrl = "https://" + res.req.headers.host + "/" + base58.encode(newUrl._id);
                answer.short_url = shortUrl;
                res.send(answer);
              });
            }

        });
    } else {
        answer.error = "Wrong url format, make sure you have a valid protocol and real site.";
        res.send(answer);
    }
});

app.get('/:encoded_id', function(req, res){
  var base58Id = req.params.encoded_id;
  var id = base58.decode(base58Id);
  
  Url.findOne({_id: id}, function (err, doc){
      if(err) return err;
    if (doc) {
      res.redirect(doc.long_url);
    } else {
      res.redirect("/");
    }
  });

});

app.listen(process.env.PORT, process.env.ID, function() {
    console.log("Server is on!");
})