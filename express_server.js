const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const usersDatabase = require("./usersDatabase.json"); // Load user data from JSON

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["secretKey"], // Change this to a secure random key
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {};

function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}

function emailExists(email) {
  return Object.values(usersDatabase).some((user) => user.email === email);
}

function getUserByEmail(email) {
  return Object.values(usersDatabase).find((user) => user.email === email);
}

app.set("view engine", "ejs");

// Root route - render the welcome page if not logged in, otherwise redirect to /urls
app.get("/", (req, res) => {
  res.render("welcome");
});

app.get("/urls", (req, res) => {
  const user = usersDatabase[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user,
      urls: urlDatabase,
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const user = usersDatabase[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user,
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const user = usersDatabase[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;

    urlDatabase[shortURL] = {
      longURL,
      userID: user.id,
    };

    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = usersDatabase[req.session.user_id];
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];

  if (!user) {
    res.redirect("/login");
  } else if (!url || url.userID !== user.id) {
    res.status(403).send("Permission Denied");
  } else {
    const templateVars = {
      user,
      shortURL,
      longURL: url.longURL,
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = usersDatabase[req.session.user_id];
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];

  if (!user) {
    res.redirect("/login");
  } else if (!url || url.userID !== user.id) {
    res.status(403).send("Permission Denied");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.user_id],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password || emailExists(email)) {
    res.status(400).send("Invalid Registration");
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    usersDatabase[id] = {
      id,
      email,
      password: hashedPassword,
    };
    req.session.user_id = id; // Set the user's session
    res.redirect("/urls/new");
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.user_id],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Incorrect email or password");
  } else {
    req.session.user_id = user.id; // Set the user's session
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null; // Clear the user's session
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});
