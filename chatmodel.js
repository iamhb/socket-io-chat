var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({

    userName: { type: String },
    ipAdd: { type: String },
    macAdd: { type: String },
    lastLogin: { type: String },
    message: [{
        crAt: { type: String },
        content: { type: String }
    }]
});

var chat = mongoose.model('chatCollection', chatSchema);
module.exports = { chat: chat };