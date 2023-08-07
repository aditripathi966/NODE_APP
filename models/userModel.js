const mongoose=require("mongoose");
const plm=require("passport-local-mongoose");

const userModel = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

userModel.plugin(plm)

const user= mongoose.model("user",userModel);

module.exports=user;