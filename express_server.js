const express = require("express");
const app = express();
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

// Route handler to handle POST requests to /urls
app.post("/urls", (req, res) => {
  // Generate a unique ID for the URL (you should implement generateRandomString)
  const shortURL = generateRandomString(); // Implement this function to generate a unique string

  // Get the long URL from the form data submitted in the POST request
  const longURL = req.body.longURL; // Assuming the form field name is "longURL"

  // Add the id-longURL pair to the urlDatabase
  urlDatabase[shortURL] = longURL;

  // Redirect the user to the /urls/:id page
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Function to generate a random alphanumeric string (replace with your implementation)
function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: req.params.longURL }; /* What goes here? */
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


