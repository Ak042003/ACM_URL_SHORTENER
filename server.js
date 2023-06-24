//the required modules express, mongoose, and the ShortUrl model/schema are imported.
// An instance of the Express application is created.
const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shorturl')
const app = express()

mongoose.connect('mongodb://0.0.0.0:27017/urlShortener', {
  useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
    try {
      const shortUrls = await ShortUrl.find()
      res.render('index', { shortUrls: shortUrls })
    } catch (error) {
      console.log(error)
      res.status(500).send('Internal Server Error')
    }
  })

app.post('/shortUrls', async (req, res) => {
    try {
      const existingShortUrl = await ShortUrl.findOne({ full: req.body.fullUrl })
      if (existingShortUrl) {
        const shortUrls = await ShortUrl.find()
        return res.render('index', { shortUrls: shortUrls, error: 'URL already shortened' })
      }
  
      const shortUrl = await ShortUrl.create({ full: req.body.fullUrl })
      res.redirect('/')
    } catch (error) {
      console.log(error)
      res.status(500).send('Internal Server Error')
    }
  })

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)

  shortUrl.clicks++
  shortUrl.save()

  res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);