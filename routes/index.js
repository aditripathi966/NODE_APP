var express = require('express');
var router = express.Router();
const User=require("../models/userModel");

const Todomodel=require("../models/todoModel");

const { sendmail } = require("../utils/mail");

const upload = require("../utils/multer");

const fs= require("fs");   

// file system

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

router.get("/home", isLoggedIn, async function (req, res, next) {
  try {
      console.log(req.user);
      // const user = await UserModel.findById(req.user._id).populate("todos");
      const { todos } = await req.user.populate("todos");
      console.log(todos);
      res.render("home", { title: "Homepage", todos, user: req.user });
  } catch (error) {
      res.send(error);
  }
});

router.get('/delete/:id', async function(req, res, next) {

  try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/home");
  }
  catch(error){
      res.send(error)
  }
});

router.post('/signin', passport.authenticate("local", {
          failureRedirect: "/signin",
          successRedirect: "/home",
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
router.post("/forgetpw", async function (req, res, next) {
  try {
      const user = await User.findOne({ email: req.body.email });

      if (user === null) {
          return res.send(
              `User not found. <a href="/forgetpw">Forget Password</a>`
          );
      }
      sendmail(req, res, user);
  } catch (error) {
      res.send(error);
  }
});

router.get("/changepass/:id", function (req, res, next) {
  res.render("changepass", {
      title: "changepass",
      id: req.params.id,
      user: null,
  });
});

router.post('/changepass/:id', async function(req, res, next) {
       try {
           const user = await User.findById(req.params.id);
           if (user.passwordResetToken === 1){
            await user.setPassword(req.body.password);
            user.passwordResetToken = 0;
           }else{

            res.send(`link expired try again <a href="/forgetpw">Forget Password</a>`);

           }
           await user.save();

           res.redirect("/signin");

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
  res.redirect("/home")
    });
  router.get("/reset/:id",isLoggedIn, async function (req, res, next) {
      res.render("reset", { title: "reset password", id: req.params.id,user:req.user })
  })
    
  router.post('/reset/:id',isLoggedIn, async function (req, res, next) {
    try {
      await req.user.changePassword(req.body.oldpassword, req.body.password);
      await req.user.save();
      res.redirect("/home");
  } catch (error) {
      res.send(error.message);
  }
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
      res.render("profile", { title: "Profile", user: req.user });
  } catch (error) {
      res.send(error);
  }
});

router.post("/avatar",upload.single("avatar"),isLoggedIn,async function (req, res, next) {
      try {
          if (req.user.avatar !== "default.jpg") {
              fs.unlinkSync(`./public/images/${req.user.avatar}`)
          }
          req.user.avatar = req.file.filename;
           req.user.save();
          res.redirect("/profile");
      } catch (error) {
          res.send(error);
      }
  }
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect("/signin");
}

module.exports = router;

// --------------------------------------------------------------------------

router.get("/createtodo", isLoggedIn, async function (req, res, next) {
  try {
      res.render("createtodo", { title: "Create Todo", user: req.user });
  } catch (error) {
      res.send(error);
  }
});

router.post("/createtodo", isLoggedIn , async function (req, res, next){
    try {
        const todo = new Todomodel(req.body);
        todo.user = req.user._id;
        req.user.todos.push(todo._id);
        await todo.save();
        await req.user.save();
        res.redirect("/home")

    } catch (error) {
          res.send(error);
    }
})
router.get("/updatetodo/:id", isLoggedIn, async function (req, res, next) {
    try {
        const todo = await Todomodel.findById(req.params.id);
        res.render("updatetodo", {
            title: "Update Todo",
            user: req.user,
            todo,
        });
    } catch (error) {
        res.send(error);
    }
});

router.post("/updatetodo/:id", isLoggedIn, async function (req, res, next) {
    try {
        await Todomodel.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/home");
    } catch (error) {
        res.send(error);
    }
});

router.get("/deletetodo/:id", isLoggedIn, async function (req, res, next) {
    try {
        await Todomodel.findByIdAndDelete(req.params.id);
        res.redirect("/home");
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;




