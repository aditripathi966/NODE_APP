var express = require('express');
var router = express.Router();
const User=require("../models/userModel");
// const user=require("../models/userModel");
// const userModel = require("../models/userModel");

const passport = require("passport");
const LocalStartegy = require("passport-local");

passport.use(new LocalStartegy(User.authenticate()))


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home-page', user: req.user });
});
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'sign-Up',user: req.user });
});
router.post("/signup", async function (req, res, next) {
  try {
      const { username, password, email } = req.body;

      const newuser = new User({ username, email });

      const user = await User.register(newuser, password);

      res.redirect("/signin");

  } catch (error) {

      res.send(error.message);
  }
});
router.get('/signin', function(req, res, next) {
  res.render('signin', { title: 'sign-In', user: req.user });
});

router.get('/profile',isLoggedIn, async function(req, res, next) {
      
  try {
         console.log(req.user);
        const users= await User.find();
        res.render("profile", {title:"profile",users, user: req.user});
  }
  catch(error){
      res.send(error)
  }

});

router.get('/delete/:id', async function(req, res, next) {

  try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/profile");
  }
  catch(error){
      res.send(error)
  }
});

router.post('/signin', passport.authenticate("local", {
          failureRedirect: "/signin",
          successRedirect: "/profile",
}),
     function(req,res,next) {}
);
router.get('/forgetpw', function(req, res, next) {
  res.render('forgetpw', { title: 'forgetpw', user: req.user });
});
router.get('/signout', isLoggedIn ,async function(req, res, next) {
    req.logOut(() => {
         res.redirect("/signin");
    })
});
router.post('/forgetpw', async function(req, res, next) {
    try {
        const user = await User.findOne({email: req.body.email})

        if (user == null){
            return res.send(
                `user not found. <a href ="/forgetpw">Forget password</a>`
            )
        }
          res.redirect("/changepass/" + user._id)
    } catch (error) {
           res.send(error)
    }
});
router.get('/changepass/:id', function(req, res, next) {
      res.render("changepass",{
          title: "changepass",
          id:req.params.id,
      })
});
router.post('/changepass/:id', async function(req, res, next) {
       try {
           await User.findByIdAndUpdate(req.params.id , req.body)
           res.redirect("/signin") 
               
       } catch (error) {
             res.send(error)
       }
  });



router.get('/update/:id', async function(req, res, next) {

  try {
       
        const currentuser =  await User.findOne({
          _id: req.params.id
        });
       res.render("updateUser", {user: currentuser,user: req.user})
  }
  catch(error){
      res.send(error)
  }
});

router.post('/update/:userid', async function(req, res, next) {
   var currentUser= await User.findOneAndUpdate({
             _id: req.params.userid
   }, {
     username: req.body.username,
     email: req.body.email,
     password: req.body.password,
   })
  res.redirect("/profile")
    });
  router.get("/reset/:id",isLoggedIn, async function (req, res, next) {
      res.render("reset", { title: "reset password", id: req.params.id,user:req.user })
  })
    
  router.post('/reset/:id',isLoggedIn, async function (req, res, next) {
      try {

        const { oldpassword, password } = req.body
        const user = await User.findById(req.params.id)
        if (oldpassword !== user.password) {
          return res.send(
            `incorrect password. <a href="/reset/${user._id}">Reset Again</a> `
          )
        }
        await User.findByIdAndUpdate(req.params.id, req.body)
        res.redirect("/profile")
      }
      catch (error) {
        res.send(error)
      }
    
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect("/signin");
}

module.exports = router;
