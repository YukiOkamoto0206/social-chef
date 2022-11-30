const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));
const fetch = require('node-fetch');

const mysql = require('mysql');
const pool = dbConnection();

// for environment file
const dotenv = require('dotenv');
dotenv.config();

// [login page] (POST /login)
app.post('/', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  let sql = `SELECT pWord
             FROM users
             WHERE username =  ?`;
  let rows = await executeSQL(sql, [username]);
  if (sql.pWord == password) {
    req.session.authenticated = true;
    res.render('home');
  } else {
    res.render('login', { error: 'Wrong Credentials!' });
  }
});

// [create/sign in] (POST /create)
app.post('/create', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let country = req.body.country;

  let sql = `INSERT INTO users
              (username, pWord, firstName, lastName, country)
              VALUES
              (?, ?, ?, ?, ?)`;

  let params = [username, password, firstName, lastName, country];
  let rows = await executeSQL(sql, params);
  res.render('login');
});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/create', (req, res) => {
  res.render('create');
});

// [home page] (GET /home)
app.get('/home', async (req, res) => {
  let sql = `Select * from cuisines`;
  let cuisines = await executeSQL(sql);
  res.render('home', { cuisines: cuisines });
});

app.get('/homeSearch', async (req, res) => {
  // Grabbing the info from the form in home page
  let keyword = req.query.keyword;
  let cuisineType = req.query.cuisine;
  let mealTime = req.query.time;

  if (mealTime == undefined) {
    mealTime = 'lunch';
  }

  // puting that info into the api url and turning the response into json
  let apiCall = `https://api.edamam.com/api/recipes/v2?type=public&q=${keyword}&app_id=${process.env.API_ID}&app_key=${process.env.API_KEY}&cuisineType=${cuisineType}&mealType=${mealTime}`;
  let response = await fetch(apiCall);
  let recipes = await response.json();

  // grabbing the cuisines from the database
  let sql = `Select * from cuisines`;
  let cuisines = await executeSQL(sql);

  // passing the data onto the home page from the db and api call
  res.render('home', { cuisines: cuisines, recipes: recipes });
});

app.get('/saved', (req, res) => {
  res.render('saved');
});

// [logout] (GET /login)
app.get('/logout', (req, res) => {
  res.redirect('login');
});

// [settings] (GET /userInfo)
app.get('/settings', (req, res) => {
  res.render('settings');
});

// [add/update settings] (POST /userInfo)
app.post('/update', (req, res) => {
  res.redirect('userInfo');
});

// [new recipe] has input form (GET /recipe)
app.get('/newRecipe', (req, res) => {
  res.redirect('recipe');
});

// [add recipes] in your own (use form from scrach without api) (POST /recipe)

// [save recipes] from api (GET /savedRecipes)

// [new recipe] has input form (GET /recipe)
app.get('/addRecipe', (req, res) => {
  res.render('newRecipe');
});
// [add recipes] in your own (use form from scrach without api) (POST /recipe)

// [delete recipes] (GET /recipe)

// [logout] (GET /login)
app.get('/logout', (req, res) => {
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
    connectionLimit: 100,
    host: 'h1use0ulyws4lqr1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'e7lupxcx8d4xn9t6',
    password: 'cay2rck66m43hje5',
    database: 'ejes6a2uewb3lyp4',
  });

  return pool;
} //dbConnection

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
