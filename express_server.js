const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080

// Set the view engine to ejs
app.set("view engine", "ejs");

// Install and require the necessary middleware
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

// Tell the Express app to use middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Function to generate a random alphanumeric string
function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}

// Connect urlDatabase to the server
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", ID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", ID: "aJ48lW" }
};

// Connect users to the server
const users = {
  "aJ48lW": {
    ID: "aJ48lW",
    email: "qais@gmail.com",
    password: "123456"
  },
  "user2RandomID": {
    ID: "user2RandomID",
    email: "jinab@yahoo.com",
    password: "dishwasher-funk"
  }
};

// Helper function to check if an email exists in users
function emailExists(email) {
  return Object.values(users).some((user) => user.email === email);
}

// Helper function to get a user by email
function getUserByEmail(email) {
  return Object.values(users).find((user) => user.email === email);
}

// Define a route handler for the root path ("/")
app.get("/", (req, res) => {
  // Redirect the user to the "/urls" page if logged in, or to "/login" if not logged in
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// POST /urls - Add a new URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const ID = req.cookies["user_id"];

  // Add the URL to your urlDatabase
  urlDatabase[shortURL] = { longURL: longURL, ID: ID };

  // Redirect the user to their list of URLs
  res.redirect("/urls");
});

// GET /urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// GET /register
app.get("/register", (req, res) => {
  res.render("urls_register");
});

// POST /register
app.post("/register", (req, res) => {
  const ID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send("Email and password are required");
    return;
  }

  if (emailExists(email)) {
    res.status(400).send("Email already exists");
    return;
  }

  users[ID] = { ID, email, hashedPassword };
  res.cookie("user_id", ID);
  res.redirect("/urls");
});

// GET /login
app.get("/login", (req, res) => {
  res.render("urls_login");
});

// POST /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Email and password are required");
    return;
  }

  const user = getUserByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
    res.status(403).send("Incorrect email or password");
    return;
  }

  res.cookie("user_id", user.ID);
  res.redirect("/urls");
});

// POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Helper function to check if an email exists in users
function emailExists(email) {
  return Object.values(users).some((user) => user.email === email);
}

// Helper function to get a user by email
function getUserByEmail(email) {
  return Object.values(users).find((user) => user.email === email);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
