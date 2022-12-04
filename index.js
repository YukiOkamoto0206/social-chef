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
const e = require('express');
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
  let username = req.body.username;
  let password = req.body.password;
  let passwordHash = '';
  const sql = ` SELECT userID, pWord
                FROM users
                WHERE username = ?`;
  let rows = await executeSQL(sql, username);

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
  let retype = req.body.re_password;

  if (password != retype) {
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
app.get('/home', isAuthenticated, async (req, res) => {
  let sql = `Select * from cuisines`;
  let cuisines = await executeSQL(sql);

  let userID = req.session.userId;
  sql = `select firstName from users where userID = ?`;
  let fName = await executeSQL(sql, userID);

  let dailyCall = `https://api.edamam.com/api/recipes/v2?type=public&q=chicken&app_id=${process.env.API_ID}&app_key=${process.env.API_KEY}`;
  let response = await fetch(dailyCall);
  let daily = await response.json();

  res.render('home', { cuisines: cuisines, daily: daily, firstN: fName });
});

app.get('/homeSearch', isAuthenticated, async (req, res) => {
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

  let userID = req.session.userId;
  sql = `select firstName from users where userID = ?`;
  let fName = await executeSQL(sql, userID);

  //passing the data onto the home page from the db and api call
  res.render('home', {
    cuisines: cuisines,
    recipes: recipes,
    daily: daily,
    firstN: fName,
  });
});

// [settings] (GET /userInfo)
app.get('/settings', isAuthenticated, async (req, res) => {
  let sql = ` SELECT * 
              FROM users
              WHERE userId = ?`;
  let params = req.session.userId;
  let data = await executeSQL(sql, [params]);
  let userID = req.session.userId;
  sql = `select firstName from users where userID = ?`;
  let fName = await executeSQL(sql, userID);
  res.render('settings', { data: data[0], firstN: fName});
});

// [add/update settings] (POST /userInfo)
app.post('/settings', isAuthenticated, async (req, res) => {
  let username = req.body.username;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let country = req.body.country;
  let sql = `UPDATE users
              SET 
              username = ?,
              firstName = ?,
              lastName = ?,
              country = ?
              WHERE userId = ?`;
  let params = [username, firstName, lastName, country, req.session.userId];
  await executeSQL(sql, params);
  res.redirect('settings');
});

app.post('/password', isAuthenticated, async (req, res) => {
  let old_password = req.body.old_password;
  let new_password = req.body.new_password;
  let userId = req.session.userId;
  let sql = ` SELECT pWord
              FROM users
              WHERE userId = ?`;
  let data = await executeSQL(sql, [userId]);
  let passwordHash = data[0].pWord;
  let match = await bcrypt.compare(old_password, passwordHash);
  if (match) {
    let hash = bcrypt.hashSync(new_password, 10);
    let updateSql = ` UPDATE users
                      SET
                      pWord = ?
                      WHERE userId = ?`;
    let params = [hash, userId];
    await executeSQL(updateSql, params);
  }
  res.redirect('settings');
});

// [new recipe] has input form (GET /recipe)
app.get('/newRecipe', isAuthenticated, async (req, res) => {
  let sql = `Select * from cuisines`;
  let cuisines = await executeSQL(sql);
  let userID = req.session.userId;
  sql = `select firstName from users where userID = ?`;
  let fName = await executeSQL(sql, userID);
  res.render('newRecipe', { cuisines: cuisines, firstN: fName});
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
  let userId = req.session.userId;
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
  let params = [
    userId,
    name,
    cuisine,
    calories,
    servingSize,
    mealTime,
    url,
    img,
  ];
  let rows = await executeSQL(sql, params);
  res.redirect('newRecipe');
});

// [save recipes] from api (GET /savedRecipes)
app.post('/saveRecipe', isAuthenticated, async (req, res) => {
  // SQL QUERY TO INSERT DATA INTO DATABASE
  const sql = `INSERT INTO recipes 
  (user_Id, recipe_name, cuisine, calories, serving_size, meal_time, recipe_link, image_link)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

  // RECIPE OBJECT WITH THE DATA PASSED THROUGH
  let recipe = {
    userId: req.session.userId,
    name: req.body.name,
    calories: req.body.calories,
    yield: req.body.servings,
    time: req.body.mealTime,
    cuisine: req.body.cuisine,
    recLink: req.body.link,
    img: req.body.img,
  };

  // ARRAY TO PASS THOSE VALUES INTO SQL QUERY TO AVOID INJECTION
  let params = [
    recipe.userId,
    recipe.name,
    recipe.cuisine,
    recipe.calories,
    recipe.yield,
    recipe.time,
    recipe.recLink,
    recipe.img,
  ];

  // INSERT AND REDIRECT TO HOME
  let rows = await executeSQL(sql, params);
  res.redirect('/home');
});

app.get('/saved', isAuthenticated, async (req, res) => {
  let userID = req.session.userId;

  let sql = `SELECT * FROM recipes WHERE user_id = ?`;
  let recipe = await executeSQL(sql, userID);

  sql = `select firstName from users where userID = ?`;
  let fName = await executeSQL(sql, userID);

  res.render('saved', { recipes: recipe, user: userID, firstN: fName });
});

// [Unsave recipes] from api (POST /saved)
app.get('/UnsaveRecipe', isAuthenticated, async (req, res) => {
  let userID = req.session.userId;

  let params = [req.query.recipeId, userID];

  let unSaveRecipe = `DELETE FROM recipes
  WHERE recipe_id = ? AND user_id = ?`;

  await executeSQL(unSaveRecipe, params);
  res.redirect('/saved');
});

// [new recipe] has input form (GET /recipe)
app.get('/addRecipe', isAuthenticated, (req, res) => {
  res.render('newRecipe');
});

// [logout] (GET /login)
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/poke', async (req, res) => {
  let userID = req.session.userId;
  sql = `select firstName from users where userID = ?`;
  let fName = await executeSQL(sql, userID);
  res.render('poke', {firstN: fName});
});

app.get('/poke/search', async (req, res) => {
  let pokeId = req.query.id;

  if (pokeId === 0) {
    pokeId++;
  }

  if (pokeId == '') {
    pokeId = 201;
  }

  if (pokeId > 649) {
    pokeId = 649;
  }

  

  userID = req.session.userId;
  sql = `select firstName from users where userID = ?`;
  let fName = await executeSQL(sql, [userID]);

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}/`);
  const data = await response.json();

  res.render('poke', {firstN: fName, pokeInfo: req.query, data: data });
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
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
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
