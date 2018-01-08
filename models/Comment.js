var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article'}
}, {timestamps: true});

// Add a JSON Method to return CommentSchema JSON
CommentSchema.methods.toJSONFor = function(user) {
    return {
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        author: this.author.toProfileJSONFor(user)
    };
};

// Register Mode
mongoose.model('Comment', CommentSchema);