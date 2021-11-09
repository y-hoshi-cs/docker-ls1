const express = require('express');
const bp = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const utils = require('./utils.js');

const app = express();

app.use(bp.urlencoded({ extended: false }));

// serving static files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));

// ホーム
app.get('/', (req, res) => {
  res.status(200).render('index', {
    title: 'Home'
  });
});

// 一覧
app.get('/blogs', async (req, res) => {
  const files = await fs.readdir(path.join(__dirname, 'data'));
  const promises = []
  for (file of files) {
    const promise = fs.readFile(path.join(__dirname, 'data', file), 'UTF-8');
    promises.push(promise)
  }
  const results = await Promise.all(promises)
  const blogs = results.map(blog => {
    return JSON.parse(blog);
  });

  res.status(200).render('blogs', {
    title: 'Blogs',
    blogs
  });
});

// 単体
app.get('/blogs/:title', async (req, res) => {
  const title = req.params.title
  if (!title) return next('err')

  const result = await fs.readFile(path.join(__dirname, 'data', `${title}.json`));
  const parsed = JSON.parse(result);

  res.status(200).render('blog', {
    title: `Blog Test`,
    blog: parsed
  });
});

// 新規作成
app.post('/blogs', async (req, res, next) => {
  console.log(req.body)
  const title = req.body.title;
  if (!title) return next('err')

  const content = utils.formPost(title, []);

  const tmpPath = path.join(__dirname, 'tmp', `${title}.json`);
  const strPath = path.join(__dirname, 'data', `${title}.json`);

  await fs.writeFile(tmpPath, JSON.stringify(content));
  await fs.access(strPath)
    .then(async () => {
      // if exists
      await fs.unlink(tmpPath);
      res.status(200).redirect(`/blogs/${title}`);
    })
    .catch(async () => {
      // if not exists
      await fs.copyFile(tmpPath, strPath);
      await fs.unlink(tmpPath);
      res.status(200).redirect(`/blogs/${title}`);
    })
});

// 更新
app.post('/blogs/:title/update', async (req, res, next) => {
  const title = req.params.title;
  if (!title) return next('err')
  const subTitles = Array.isArray(req.body.subtitle) ? req.body.subtitle : [req.body.subtitle]
  const bodies = Array.isArray(req.body.body) ? req.body.body : [req.body.body]

  const contents = subTitles.map((subtitle, index) => {
    if (bodies[index]) {
      return {
        subtitle,
        body: bodies[index]
      }
    }
  })
  const newContents = contents.map((content, index) => {
    return {
      ...content,
      ord: index
    }
  });
  const updated = utils.formPost(title, newContents)
  await fs.writeFile(path.join(__dirname, 'data', `${title}.json`), JSON.stringify(updated))
  res.status(200).redirect(`/blogs/${title}`)
});

app.use((err, req, res, next) => {
  return res.status(500).json({
    message: 'error'
  });
});

app.listen(8080)
