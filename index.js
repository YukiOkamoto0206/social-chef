const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.get('/test', (req, res) => {
  res.render('test');
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
