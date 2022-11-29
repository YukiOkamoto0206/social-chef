const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));
const fetch = require('node-fetch');

// for environment file
const dotenv = require('dotenv');
dotenv.config();

// [login page] (POST /login)
app.post('/login', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  let sql = `SELECT pWord
             FROM users
             WHERE username =  ?`;
  let rows = await executeSQL(sql, [username]);
  if(sql.pWord == password){
    req.session.authenticated = true;
    res.render('home');
  } else {
    res.render('login', {"error": "Wrong Credentials!"});
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


// [home page] (GET /home)

// [logout] (GET /login)
app.get('/logout', (req, res) => {
  res.redirect('login');
});

// [settings] (GET /userInfo)
app.get('/settings', (req, res) => {
  res.redirect('userInfo');
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

// [delete recipes] (GET /recipe)

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

async function executeSQL(sql, params){
  return new Promise (function (resolve, reject) {
  pool.query(sql, params, function (err, rows, fields) {
  if (err) throw err;
     resolve(rows);
  });
  });
  }//executeSQL
  //values in red must be updated
  function dbConnection(){
     const pool  = mysql.createPool({
        connectionLimit: 100,
        host: "cwe1u6tjijexv3r6.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
        user: "nstwa3r82fbmw3bw",
        password: "z26ca8fd64u3m9xb",
        database: "x1akpmooqm7zd50u"
     }); 
  
     return pool;
  
  } //dbConnection

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
