/**
 * If you are going to make a powerful application, 
 * You may use a configuration file and include it in your other files. 
 * In this way, you don't need to make changes for each variable on each file separately.
 */
let settings = {
    db_url: 'mongodb://localhost:27017/',
    db_name: 'mydb'
};
exports.settings = settings;