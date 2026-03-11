const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');

// Generates sitemap entries for all published topics dynamically
router.get('/sitemap-content.xml', async (req, res) => {
    try {
        const topics = await Topic.find({ isPublished: true })
            .select('slug updatedAt')
            .limit(1000)
            .lean();

        const urls = topics.map(t => `
  <url>
    <loc>https://ecokidsindia.com/topics/${t.slug}</loc>
    <lastmod>${t.updatedAt ? t.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

        res.header('Content-Type', 'application/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`);
    } catch (error) {
        res.status(500).send('Error generating sitemap');
    }
});

module.exports = router;
