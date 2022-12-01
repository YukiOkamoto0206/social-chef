const saveRecipeToAccount = (id, name, cal, yield, time, cui, img, url) => {
  // IF YOU GUYS HAVE A BETTER WAY OF ORGANIZING THIS CODE PLEASE DO!

  // CREATING A FORM IN JS TO STORE THE DATA TO SEND TO THE ROUTE
  let saveForm = document.createElement('form');
  // THIS IS TO STORE THE FORM IN A DIV OR ELSE AN ERROR IS THROWN
  let formDiv = document.getElementById('form-box');
  formDiv.innerHTML = '';

  // THE ATTRIBUTES TO HAVE THE FORM DO THE CORRECT METHODS AND ACTIONS
  saveForm.setAttribute('method', 'post');
  saveForm.setAttribute('action', '/saveRecipe');

  // CREATING THE INPUTS AND THEIR RESPECTIVE TYPES, ASWELL AS THE DATA WITHIN THEM
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
  // -----------------------------------------------------

  // PUTTING ALL THE INPUTS INTO THE FORM
  saveForm.appendChild(recipeName);
  saveForm.appendChild(recipeCalories);
  saveForm.appendChild(recipeServings);
  saveForm.appendChild(recipeTime);
  saveForm.appendChild(recipeCuisine);
  saveForm.appendChild(recipeLink);
  saveForm.appendChild(recipeImg);

  // CONNECTING THE FORM TO AN INVISIBLE DIV, ELSE IT DOESNT WORK PROPERLY
  formDiv.appendChild(saveForm);
  formDiv.style.display = 'none';
  // SUBMIT THE FORM TO THE ROUTE WITH DATA INSIDE
  saveForm.submit();
};
