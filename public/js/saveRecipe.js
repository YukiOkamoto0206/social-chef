const saveRecipeToAccount = (id, name, cal, yield, time, cui, img, url) => {
  let saveForm = document.createElement('form');
  let formDiv = document.getElementById('form-box');
  formDiv.innerHTML = '';

  saveForm.setAttribute('method', 'post');
  saveForm.setAttribute('action', '/saveRecipe');

  // Attributes that the form needs to store it into db
  let recipeName = document.createElement('input');
  recipeName.setAttribute('type', 'text');
  recipeName.setAttribute('name', 'name');
  recipeName.value = name;

  let recipeCalories = document.createElement('input');
  recipeCalories.setAttribute('type', 'number');
  recipeCalories.setAttribute('name', 'calories');
  recipeCalories.value = cal;

  let recipeServings = document.createElement('input');
  recipeServings.setAttribute('type', 'number');
  recipeServings.setAttribute('name', 'servings');
  recipeServings.value = yield;

  let recipeTime = document.createElement('input');
  recipeTime.setAttribute('type', 'text');
  recipeTime.setAttribute('name', 'mealTime');
  recipeTime.value = time;

  let recipeCuisine = document.createElement('input');
  recipeCuisine.setAttribute('type', 'text');
  recipeCuisine.setAttribute('name', 'cuisine');
  recipeCuisine.value = cui;

  let recipeLink = document.createElement('input');
  recipeLink.setAttribute('type', 'text');
  recipeLink.setAttribute('name', 'link');
  recipeLink.value = url;

  let recipeImg = document.createElement('input');
  recipeImg.setAttribute('type', 'text');
  recipeImg.setAttribute('name', 'img');
  recipeImg.value = img;

  let button = document.createElement('button');
  saveForm.appendChild(button);

  saveForm.appendChild(recipeName);
  saveForm.appendChild(recipeCalories);
  saveForm.appendChild(recipeServings);
  saveForm.appendChild(recipeTime);
  saveForm.appendChild(recipeCuisine);
  saveForm.appendChild(recipeLink);
  saveForm.appendChild(recipeImg);

  formDiv.appendChild(saveForm);
  formDiv.style.display = 'none';
  saveForm.submit();
};
