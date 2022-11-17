const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));
const fetch = require('node-fetch');

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.get('/test', (req, res) => {
  res.render('test');
});

app.get('/api', async (req, res) => {
  let recipeNumber = 0;
  let keyword = "chicken";
  let url = `https://api.edamam.com/api/recipes/v2?type=public&q=${keyword}&app_id=f48ae2a3&app_key=%20eaa868f23b6bdf17d5281c6b0041671a`;
  let response = await fetch(url);
  let data = await response.json();
  let numberOfRecipesFound = data.to;
  let recipeLink = data.hits[recipeNumber].recipe.url;
  let cuisineType = data.hits[recipeNumber].recipe.cuisineType;
  let image = data.hits[recipeNumber].recipe.image;
  let ingredientsArray = data.hits[recipeNumber].recipe.ingredientLines;
  let recipieTitle = data.hits[recipeNumber].recipe.label;
  let mealType = data.hits[recipeNumber].recipe.mealType[0];
  let recipeInfo = [numberOfRecipesFound, recipeLink, cuisineType, image, ingredientsArray, recipieTitle, mealType]
  res.render('apiTest', {"recipeInfo": recipeInfo});
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
