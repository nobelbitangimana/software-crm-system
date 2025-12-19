const axios = require('axios');

const API_BASE = 'http://localhost:3003/api';

class CRMSystemTester {
  constructor() {
    this.results = {
      authentication: {
        adminLogin: false,
    