const mongoose = require("mongoose");


const {Schema} = mongoose;

const AIdataschema = new Schema({
    question: {
        type: String,
        required: true,

    },
    answer: {
        type: String,
        required: true,
    },
    grade: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    }
},
{
    strict:false
});
const AIdatamodel = mongoose.model("AIdata", AIdataschema);
module.exports = AIdatamodel;
