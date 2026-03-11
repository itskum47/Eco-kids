const express = require('express');

const router = express.Router();

// Minimal mobile integration route to keep server boot stable.
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mobile API route is available'
  });
});

module.exports = router;
