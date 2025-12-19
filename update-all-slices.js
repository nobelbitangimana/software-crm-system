#!/usr/bin/env node

/**
 * Update all Redux slices to use enhanced API with demo fallback
 */

const fs = require('fs');
const path = require('path');

const slices = [
  'client/src/store/slices/dealsSlice.js',
  'client/src/store/slices/campaignsSlice.js',
  'client/src/store/slices/ticketsSlice.js'
];

slices.forEach(slicePath => {
  if (fs.existsSync(slicePath)) {
    let content = fs.readFileSync(slicePath, 'utf8');
    
    // Replace import
    content = content.replace(
      "import { api } from '../../services/authAPI';",
      "import { enhancedAPI } from '../../services/authAPI';"
    );
    
    // Replace all api calls with enhancedAPI
    content = content.replace(/await api\./g, 'await enhancedAPI.');
    
    // Replace _id with id for demo compatibility
    content = content.replace(/\._id/g, '.id');
    content = content.replace(/contact\._id/g, 'contact.id');
    content = content.replace(/deal\._id/g, 'deal.id');
    content = content.replace(/campaign\._id/g, 'campaign.id');
    content = content.replace(/ticket\._id/g, 'ticket.id');
    
    fs.writeFileSync(slicePath, content);
    console.log(`✅ Updated ${slicePath}`);
  } else {
    console.log(`⚠️  File not found: ${slicePath}`);
  }
});

console.log('\n🎉 All slices updated with enhanced API and demo fallback!');
console.log('Now rebuild and redeploy the frontend.');