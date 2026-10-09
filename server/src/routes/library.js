const express = require('express');
const router = express.Router();
const { getStore } = require('../db');

// GET approved library assets
router.get('/', (req, res) => {
  const { brand, season, colorway, search } = req.query;
  const store = getStore();
  let assets = [...store.approvedPhotos];

  if (brand && brand !== 'All') {
    assets = assets.filter(a => a.brand.toLowerCase() === brand.toLowerCase());
  }

  if (season && season !== 'All') {
    assets = assets.filter(a => a.season.toLowerCase() === season.toLowerCase());
  }

  if (colorway && colorway !== 'All') {
    assets = assets.filter(a => a.colorwayName.toLowerCase().includes(colorway.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    assets = assets.filter(a =>
      a.styleNumber.toLowerCase().includes(q) ||
      a.styleName.toLowerCase().includes(q) ||
      a.colorwayName.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: assets.length, data: assets });
});

module.exports = router;
