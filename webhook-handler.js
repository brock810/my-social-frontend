// webhook-handler.js
module.exports = async (req, res) => {
    // Process the incoming webhook payload from Glitch
    const payload = req.body;
    // Trigger actions or updates on the Vercel frontend based on the payload
  
    // Respond with a success status
    res.status(200).send('Webhook handled successfully');
  };
  