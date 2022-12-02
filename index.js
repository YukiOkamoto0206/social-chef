const express = require('express');
const mysql = require('mysql');
const app = express();

const bcrypt = require('bcrypt');
const session = require('express-session');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const pool = dbConnection();
const fetch = require('node-fetch');
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
    res.redirect('/home');
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
    res.redirect('/home');
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
  let retype = req.body.re-password;

  if (password != retype){
    res.render('create', { error: 'Passwords do not match!' });
  }

  let hash = bcrypt.hashSync(password, 10);
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

  let params = [username, hash, firstName, lastName, country];
  let rows = await executeSQL(sql, params);
  res.render('login');
});

app.get('/create', (req, res) => {
  res.render('create', { error: '' });
});

// [home page] (GET /home)
app.get('/home', async (req, res) => {
  let sql = `Select * from cuisines`;
  let cuisines = await executeSQL(sql);

  let dailyCall = `https://api.edamam.com/api/recipes/v2?type=public&q=chicken&app_id=${process.env.API_ID}&app_key=${process.env.API_KEY}`;
  let response = await fetch(dailyCall);
  let daily = await response.json();

  res.render('home', { cuisines: cuisines, daily: daily });
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

  let dailyCall = `https://api.edamam.com/api/recipes/v2?type=public&q=chicken&app_id=${process.env.API_ID}&app_key=${process.env.API_KEY}`;
  let dayRes = await fetch(dailyCall);
  let daily = await dayRes.json();

  // grabbing the cuisines from the database
  let sql = `Select * from cuisines`;
  let cuisines = await executeSQL(sql);

  // passing the data onto the home page from the db and api call
  res.render('home', { cuisines: cuisines, recipes: recipes, daily: daily });
});

app.get('/saved', isAuthenticated, (req, res) => {
  res.render('saved');
});

// [settings] (GET /userInfo)
app.get('/settings', isAuthenticated, async (req, res) => {
  let sql = `SELECT * FROM users`
  let data = await executeSQL(sql);
  res.render('settings', {"data": data});
});

// [add/update settings] (POST /userInfo)
app.post('/update', isAuthenticated, async (req, res) => {
  let userId = req.body.userId;
  let username = req.body.username;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let country = req.body.country;
  let sql = `UPDATE users
              SET 
              username = ?,
              pWord = ?,
              firstName = ?,
              lastName = ?,
              country = ?
              WHERE userId = ?`;
  let params = [username, password, firstName, lastName, country, userId];
  let rows = await executeSQL(sql, params);
  res.redirect('userInfo');
});

// [new recipe] has input form (GET /recipe)
app.get('/newRecipe', isAuthenticated, async (req, res) => {
  let sql = `Select * from cuisines`;
  let cuisines = await executeSQL(sql);
  res.render('newRecipe', {cuisines: cuisines});
});

// [add recipes] in your own (use form from scrach without api) (POST /recipe)
app.post('/addRecipe', isAuthenticated, async (req, res) => {
  let name = req.body.name;
  let calories = req.body.calories;
  let servingSize = req.body.servingSize;
  let cuisine = req.body.cuisine;
  let mealTime = req.body.time;
  let url = req.body.url;
  let img = req.body.img;
  let userId = req.session.userId
  let sql = `INSERT INTO recipes
             (user_id, 
              recipe_name, 
              cuisine, 
              calories, 
              serving_size, 
              meal_time, 
              recipe_link, 
              image_link)
             VALUES
             (?,?,?,?,?,?,?,?)`;
  let params = [userId, name, cuisine, calories, servingSize, mealTime, url, img];
  let rows = await executeSQL(sql, params);
  res.redirect('newRecipe');
});

// [save recipes] from api (GET /savedRecipes)
app.get('/saveRecipe', isAuthenticated, (req, res) => {
  res.redirect('saved');
});

// [new recipe] has input form (GET /recipe)
app.get('/addRecipe', isAuthenticated, (req, res) => {
  res.render('newRecipe');
});

// [delete recipes] (GET /recipe)
app.get('/deleteRecipe', isAuthenticated, async (req, res) => {
  let recipeId = req.query.recipeId;
  let userId = req.query.userId;
  let sql = `DELETE FROM recipes
             WHERE recipeId = ? AND userId = ?`;
  let rows = await executeSQL(sql, [recipeId, userId]);
  res.redirect('settings');
});

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
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host: 'h1use0ulyws4lqr1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'e7lupxcx8d4xn9t6',
    password: 'cay2rck66m43hje5',
    database: 'ejes6a2uewb3lyp4'
  });

  return pool;
} //dbConnection

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
