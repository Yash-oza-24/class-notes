const mongoose = require("mongoose")
mongoose.connect(process.env.MONGODB_URL)

const db = mongoose.connection;
db.on('error', () => { console.log("error") })
db.once('open', () => {                                                                         
    console.log('Connected to MongoDB');
})

module.exports = db;    