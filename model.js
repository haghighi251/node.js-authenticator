// Modules.
let mongoose = require('mongoose');

// Loading application configuration.
const configs = require('./configs.js').settings;

mongoose.connect(configs.db_url + configs.db_name, {useNewUrlParser: true, useUnifiedTopology: true});

// The structure of the `users` collection. This is the Schema of users collection.
const UsersSchema = new mongoose.Schema({
    email: {type: String, index: true, required: true},
    user_name: {type: String, index: true, required: true},
    full_name: {type: String, index: true},
    password: {type: String, index: true, minlength: 6},
    unique_id: {type: String, minlength: 5},
    register_at: {type: Date},
    update_at: {type: Date},
    role: {type: Number, minlength: 1,min:1,max:5},
    status: {type: Number, minlength: 1,min:1,max:5}
});

// The model of the users collection.
const users = mongoose.model('users', UsersSchema);

module.exports.users = mongoose.model('users', UsersSchema);
module.exports.db = mongoose;