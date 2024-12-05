var express = require('express');
var router = express.Router();

const User = require('../models/users');
const Tweet = require('../models/tweets');
const { checkBody } = require('../modules/checkBody');

router.post('/', async (req, res) => {
  // console.log("Received body:", req.body);
  // console.log("req.body keys:", Object.keys(req.body)); 
  const missingFields = checkBody(req.body, ['token', 'content']);
  if (missingFields) {
    res.status(400).json({ result: false, message: 'Missing or empty fields :' + missingFields.join(', ') });
    return;
  }
 try {
  const user = await User.findOne({ token: "ySYGZLjh__ZL90pG8Xqi5kD9TOrdSaU3" })
  // console.log("User:", user)
  if (!user) {
    res.status(401).json({ result: false, error: 'User not found' });
    return;
  }

  const newTweet = new Tweet({
    author: user._id,
    content: req.body.content,
    createdAt: new Date(),
  });
// console.log("New tweet:", newTweet)
   const tweetSaved = await newTweet.save()
  //  console.log("Tweet saved:", tweetSaved)
   if(!tweetSaved) {
    res.status(500).json({ result: false, message: 'Internal server error', error: error.message});
    return;
   } else {
    res.status(200).json({ result: true, tweet: tweetSaved });
   }
  } catch (error) {
  res.status(500).json({ result: false, message: 'Internal server error', error: error.message});
}

});


router.get('/all/:token', async (req, res) => {
 const user = await User.findOne({ token: req.params.token })
    if (!user) {
      res.status(401).json({ result: false, error: 'User not found' });
      return;
    }

   const tweets = await Tweet.find() // Populate and select specific fields to return (for security purposes)
      .populate('author', ['username', 'firstname'])
      .populate('likes', ['username', 'firstname'])
      .sort({ createdAt: 'desc' })
    
        res.status(200).json({ result: true, tweets });
      });
 


router.get('/trends/:token', async (req, res) => {
 const user = await User.findOne({ token: req.params.token })
    if (!user) {
      res.status(401).json({ result: false, error: 'User not found' });
      return;
    }

   const findedTweets = await Tweet.find({ content: { $regex: /#/ } })
    .populate('author', ['username', 'firstname'])
    .populate('likes', ['username', 'firstname'])
    .sort({ createdAt: 'desc' })
        const hashtags = [];

        for (const tweet of findedTweets) {
          const filteredHashtags = await tweet.content.split(' ').filter(word => word.startsWith('#') && word.length > 1);
          hashtags.push(...filteredHashtags);
        }

        const trends = [];

        for (const hashtag of hashtags) {
          const trendIndex = trends.findIndex(trend => trend.hashtag === hashtag);
          if (trendIndex === -1) {
            trends.push({ hashtag, count: 1 });
          } else {
            trends[trendIndex].count++;
          }
        }

        res.status(200).json({ result: true, trends: trends.sort((a, b) => b.count - a.count) });
      });
  


      router.get('/hashtag/:token/:query', async (req, res) => {
        try {
            // Vérifiez si l'utilisateur existe avec le token
            const user = await User.findOne({ token: req.params.token });
            if (!user) {
                return res.status(401).json({ result: false, error: 'User not found' });
            }
    
            // Rechercher des tweets contenant le hashtag
            const tweets = await Tweet.find({ 
                content: { $regex: new RegExp('#' + req.params.query, 'i') }
            })
            .populate('author', ['username', 'firstname'])
            .populate('likes', ['username', 'firstname'])
            .sort({ createdAt: 'desc' });
    
            // Vérifier si des tweets ont été trouvés
            if (tweets.length === 0) {
                return res.status(404).json({ result: false, error: 'No tweets found for this hashtag' });
            }
    
            // Répondre avec les tweets trouvés
            return res.status(200).json({ result: true, tweets });
    
        } catch (error) {
            console.error('An error occurred:', error);
            return res.status(500).json({ result: false, error: 'Server error' });
        }
    });
    
 
  
    router.get('/hashtag/:token/:query', async (req, res) => {
      try {
          // Vérifiez si l'utilisateur existe avec le token
          const user = await User.findOne({ token: req.params.token });
          if (!user) {
              return res.status(401).json({ result: false, error: 'User not found' });
          }
  
          // Rechercher des tweets contenant le hashtag
          const tweets = await Tweet.find({ 
              content: { $regex: new RegExp('#' + req.params.query, 'i') }
          })
          .populate('author', ['username', 'firstname'])
          .populate('likes', ['username'])
          .sort({ createdAt: 'desc' });
  
          // Vérifier si des tweets ont été trouvés
          if (tweets.length === 0) {
              return res.status(404).json({ result: false, error: 'No tweets found for this hashtag' });
          }
  
          // Répondre avec les tweets trouvés
          return res.status(200).json({ result: true, tweets });
  
      } catch (error) {
          console.error('An error occurred:', error);
          return res.status(500).json({ result: false, error: 'Server error' });
      }
  });
  

router.put('/like',  async (req, res) => {
  // console.log("Received body:", req.body);  
  const missingFields = checkBody(req.body, ['token', 'tweetId']);
  if (missingFields) {
    res.status(400).json({ result: false, message: 'Missing or empty fields :' + missingFields.join(', ') });
    return;
  }
 

  const user = await User.findOne({ token: req.body.token })
    if (!user) {
      res.status(401).json({ result: false, error: 'User not found' });
      return;
    }

   const tweet = await Tweet.findById(req.body.tweetId)
      if (!tweet) {
        res.status(404).json({ result: false, error: 'Tweet not found' });
        return;
      }

      if (tweet.likes.includes(user._id)) { // User already liked the tweet
        const result = await Tweet.updateOne({ _id: tweet._id }, { $pull: { likes: user._id } }) // Remove user ID from likes
          
            res.json({ result: true, result });
      } else { // User has not liked the tweet
       const result = await Tweet.updateOne({ _id: tweet._id }, { $push: { likes: user._id } }) // Add user ID to likes
          
            res.json({ result: true , result});
          
          }

        })
     


router.delete('/', async (req, res) => {
// console.log("Received body:", req.body);
  const missingFields = checkBody(req.body, ['token', 'tweetId']);
  if (missingFields) {
    res.status(400).json({ result: false, message: 'Missing or empty fields: ' + missingFields.join(', ') });
    return;
  }
 

 const user = await User.findOne({ token: req.body.token })
    if (!user) {
      res.status(401).json({ result: false, error: 'User not found' });
      return;
    }
console.log("User:", user)
   const tweet = await Tweet.findById(req.body.tweetId)
      .populate('author', ['username', 'firstname'])
      .populate('likes', ['username'])
    
        if (!tweet) {
          res.status(404).json({ result: false, error: 'Tweet not found' });
          return;
        } else if (String(tweet.author._id) !== String(user._id)) { // ObjectId needs to be converted to string (JavaScript cannot compare two objects)
          res.status(403).json({ result: false, error: 'Tweet can only be deleted by its author' });
          return;
        }
// console.log("Tweet:", tweet)
  const tweetToDelete = tweet;
       await Tweet.deleteOne({ _id: tweet._id })
          res.status(200).json({ result: true, tweet: tweetToDelete });
        });
      
 

module.exports = router;
