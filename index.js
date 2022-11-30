const express = require('express');
const mysql = require('mysql');
const app = express();
const pool = dbConnection();
const bcrypt = require('bcrypt');
const session = require('express-session');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// for environment file
require('dotenv').config();

app.set('trust proxy', 1); // trust first proxy
const option = {
  secret: 'random ch@r@ct3rs',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 },
};
app.use(session(option));
app.use(express.json());

// middleware function
const isAuthenticated = (req, res, next) => {
  if (req.session.userId != undefined) {
    next();
  } else {
    res.redirect('/');
  }
};

app.get('/', (req, res) => {
  if (req.session.userId != undefined) {
    res.render('home');
  } else {
    res.render('login');
  }
});

// [login page] (POST /login)
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let passwordHash = '';
  const sql = ` SELECT userID, pWord
                FROM users
                WHERE username = ?`;
  const rows = await executeSQL(sql, username);

  if (rows.length > 0) {
    passwordHash = rows[0].pWord;
  }

  const match = await bcrypt.compare(password, passwordHash);
  if (match) {
    req.session.userId = rows[0].userID;
    res.render('home');
  } else {
    res.redirect('/');
  }
});

// [create/sign in] (POST /create)
app.post('/create', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let country = req.body.country;

  // validation for duplicate user
  let sql_user = `SELECT username
                  FROM users`;
  let user_row = await executeSQL(sql_user);
  for (i = 0; i < user_row.length; i++) {
    if (user_row[i].username == username) {
      console.log('error_create');
      res.render('create', { error: 'Account has already exsisted!' });
    }
  }

  let sql = `INSERT INTO users
              (username, pWord, firstName, lastName, country)
              VALUES
              (?, ?, ?, ?, ?)`;

  let params = [username, password, firstName, lastName, country];
  let rows = await executeSQL(sql, params);
  res.render('login');
});

app.get('/create', (req, res) => {
  res.render('create', { error: '' });
});

// [home page] (GET /home)
app.get('/home', isAuthenticated, (req, res) => {
  res.render('home');
});

app.get('/saved', isAuthenticated, (req, res) => {
  res.render('saved');
});

// [settings] (GET /userInfo)
app.get('/settings', isAuthenticated, (req, res) => {
  res.render('settings');
});

// [add/update settings] (POST /userInfo)
app.post('/update', isAuthenticated, (req, res) => {
  res.redirect('userInfo');
});

// [new recipe] has input form (GET /recipe)
app.get('/newRecipe', isAuthenticated, (req, res) => {
  res.redirect('recipe');
});

// [add recipes] in your own (use form from scrach without api) (POST /recipe)

// [save recipes] from api (GET /savedRecipes)

// [new recipe] has input form (GET /recipe)
app.get('/addRecipe', isAuthenticated, (req, res) => {
  res.render('newRecipe');
});
// [add recipes] in your own (use form from scrach without api) (POST /recipe)

// [delete recipes] (GET /recipe)

// [logout] (GET /login)
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/test', (req, res) => {
  res.render('test');
});

app.get('/api', async (req, res) => {
  console.log(process.env.API_KEY);
  let recipeNumber = 0;
  let keyword = 'chicken';
  let url = `https://api.edamam.com/api/recipes/v2?type=public&q=${keyword}&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`;
  let response = await fetch(url);
  let data = await response.json();
  let numberOfRecipesFound = data.to;
  let recipeLink = data.hits[recipeNumber].recipe.url;
  let cuisineType = data.hits[recipeNumber].recipe.cuisineType;
  let image = data.hits[recipeNumber].recipe.image;
  let ingredientsArray = data.hits[recipeNumber].recipe.ingredientLines;
  let recipieTitle = data.hits[recipeNumber].recipe.label;
  let mealType = data.hits[recipeNumber].recipe.mealType[0];
  let recipeInfo = [
    numberOfRecipesFound,
    recipeLink,
    cuisineType,
    image,
    ingredientsArray,
    recipieTitle,
    mealType,
  ];
  res.render('apiTest', { recipeInfo: recipeInfo });
});

async function executeSQL(sql, params) {
  return new Promise(function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
} //executeSQL
//values in red must be updated
function dbConnection() {
  const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'cwe1u6tjijexv3r6.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'nstwa3r82fbmw3bw',
    password: 'z26ca8fd64u3m9xb',
    database: 'x1akpmooqm7zd50u',
  });
  return pool;
} //dbConnection

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
