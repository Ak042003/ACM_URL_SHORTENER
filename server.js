//the required modules express, mongoose, and the ShortUrl model/schema are imported.
// An instance of the Express application is created.
const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shorturl')
const app = express()

mongoose.connect('mongodb+srv://arpankcogni:arpan123@cluster0.0sfrbfc.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

//search functionality
app.get('/', async (req, res) => {
  const searchText = req.query.q; // Get the search query from the request
  let shortUrls;
  let errorMessage = '';

  if (searchText) {
      shortUrls = await ShortUrl.find({
          $or: [
              { full: { $regex: searchText, $options: 'i' } },
              { short: { $regex: searchText, $options: 'i' } }, 
              { note: { $regex: searchText, $options: 'i' } }, 
          ],
      }).exec();
  } else {
      shortUrls = await ShortUrl.find().exec(); // Fetch all short URLs if no search query provided
  }
  res.render('index', { shortUrls, errorMessage });

});


app.post('/shortUrls', async (req, res) => {
  const { fullUrl, note } = req.body;
  const existingShortUrl = await ShortUrl.findOne({ full: fullUrl });

  if (existingShortUrl) {
      let errorMessage = 'URL already exists.';
      const shortUrls = await ShortUrl.find().exec();
      res.render('index', { shortUrls, errorMessage });
  } else {
      if(note){
      const existingNote = await ShortUrl.findOne({ note: note });

      if (existingNote) {
          let errorMessage = 'Note already exists.';
          const shortUrls = await ShortUrl.find().exec();
          res.render('index', { shortUrls, errorMessage });
      } else {
          await ShortUrl.create({ full: fullUrl, note });
          res.redirect('/');
      }
   }else
  {
      await ShortUrl.create({ full: fullUrl });
      res.redirect('/');
  }

  }
});
  

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)

  shortUrl.clicks++
  shortUrl.save()

  res.redirect(shortUrl.full)
});

app.post('/shortUrls/:id/delete', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findByIdAndDelete(req.params.id);
    if (!shortUrl) {
      return res.status(404).send('Short URL not found');
    }

    console.log('Short URL deleted:', shortUrl);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});




app.listen(process.env.PORT || 5000);
