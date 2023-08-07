const mongoose=require("mongoose");

mongoose
     .connect("mongodb://127.0.0.1:27017/mern6")
     .then(() => console.log("db coonected!"))
     .catch((err) =>console.log(err));