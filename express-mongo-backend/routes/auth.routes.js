const authController = require("express").Router();

// User model
const User           = require("../models/user");

// BCrypt to encrypt passwords
const bcrypt         = require("bcryptjs");
const bcryptSalt     = 10;



authController.post("/signup", (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const username = req.body.username;
  const userPassword = req.body.password;


  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      console.log("User with username exists already:"+username);
      res.status(200).json({ 'errormessage': 'this user already exists' });
      return;
    }

    const salt     = bcrypt.genSaltSync(bcryptSalt);
    const password = bcrypt.hashSync(userPassword, salt);

    const userPassworEncrypted = {username, password, firstname, lastname};
    console.log("User will be created:"+userPassworEncrypted);

    User
      .create(userPassworEncrypted)
      .then((user) => {
        res.status(200).json(user);
      })
      .catch(err => console.log(err));
  });
});

authController.get("/login", (req, res) => res.render("auth/login"));

authController.post("/login", (req, res) => {
  const username = req.body.username;
  const userPassword = req.body.password;

  if (username === "" || userPassword === "") {
    res.render("auth/login", { errorMessage: "Provide both, username and password to login." });
    return;
  }

  User.findOne({ username }, "_id username password", (err, user) => {
    if (err || !user) {
      res.render("auth/login", { errorMessage: "The username doesn't exist." });
    } else {
      if (bcrypt.compareSync(userPassword, user.password)) {
        req.session.currentUser = user;
        res.redirect("/");
      } else {
        res.render("auth/login", { errorMessage: "Incorrect password." });
      }
    }
  });
});

authController.get("/logout", (req, res, next) => {
  if (!req.session.currentUser) { 
    res.redirect("/login"); 
    return; 
  }

  req.session.destroy( err => {
    if (err) { 
      console.log(err); 
    } else { 
      res.redirect("/login"); 
    }
  });
});

module.exports = authController;
