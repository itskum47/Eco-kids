/**
 * AI Routes
 * Central hub for all AI-powered features
 * Features: EcoBot Chatbot, Learning Path, Quiz Generator, Photo Verification
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

/**
 * ======================
 * FEATURE 1: EcoBot Chat
 * ======================
 */

// Chat message validation
const chatValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 500 }).withMessage('Message must be 500 characters or less')
];

// POST /api/v1/ai/chat — Send message to EcoBot (streaming response)
router.post('/chat', protect, chatValidation, chatbotController.postMessage);

// GET /api/v1/ai/chat/history — Retrieve chat history
router.get('/chat/history', protect, chatbotController.getHistory);

// DELETE /api/v1/ai/chat/history — Clear chat history
router.delete('/chat/history', protect, chatbotController.clearHistory);

module.exports = router;
