var router = require('express').Router();
var mongoose = require('mongoose');
var Article = mongoose.model('Article');

// Using the find and distinct methods from Mongoose, we can gather the list 
// of all unique tags that have been added to articles -- 
// no additional database or model logic required.

router.get('/', function(req, res, next) {
    Article.find().distinct('tagList').then(function(tags){
        return res.json({tags: tags});
    }).catch(next);
});

module.exports = router;