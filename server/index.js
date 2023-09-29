//imports
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

//mongoDB connection
const dbURI = 'mongodb+srv://danielzanefinger:f8hi0l9uLRAeXbrn@cluster0.arhghcr.mongodb.net/leaderboards?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => console.log("connected to db"))
    .catch((err) => console.log(err));

app.use(express.json());

//schema
const leaderboardSchema = new mongoose.Schema({
  name: String,
  clicks: Number,
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema, 'leaderboards');

module.exports = Leaderboard;

  
app.get('/api/getLeaderboard', async (req, res) => {
    Leaderboard.find()
      .sort({ clicks: -1 }) //sort our clicks in descending order
      .limit(3) //limit the results by x(whatever we put in the paranthesis)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
      });
  });
  
  // Create an API endpoint to save user data
app.post('/api/saveUserData', async (req, res) => {
    try {
      const { name, clicks } = req.body;
  
      // Create a new leaderboard data document
      const leaderboardData = new Leaderboard({
        name,
        clicks,
      });
  
      // Save the data to MongoDB
      await leaderboardData.save();
  
      res.status(200).json({ message: 'Leaderboard data saved successfully' });
    } catch (error) {
      console.error('Error saving leaderboard data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
    
  // Start the server
  app.listen(5000, () => {
    console.log('Server is running on port 5000');
  });