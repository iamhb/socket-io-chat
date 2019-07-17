var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
    
    username: {type : String},
    ipaddress: {type: String},
    lastLogin:  {type: String},
    message:[{
        crAt: {type: String},
        content: {type : String}
    }]
});

var chat = mongoose.model('chatCollection', chatSchema);
module.exports = { chat: chat};