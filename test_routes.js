const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRoutes() {
  try {
    console.log('--- Test: Inscription ---');
    const registerResponse = await axios.post(`${BASE_URL}/register`, {
      username: 'testuser',
      password: 'testpassword',
      role: 'user',
    });
    console.log('Inscription réussie:', registerResponse.data);

    console.log('--- Test: Connexion ---');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: 'testuser',
      password: 'testpassword',
    });
    console.log('Connexion réussie:', loginResponse.data);

    const token = loginResponse.data.token;

    console.log('--- Test: Route protégée (GET /beneficiaires) ---');
    const beneficiairesResponse = await axios.get(`${BASE_URL}/beneficiaires`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Liste des bénéficiaires:', beneficiairesResponse.data);
  } catch (error) {
    if (error.response) {
      console.error('Erreur:', error.response.status, error.response.data);
    } else {
      console.error('Erreur:', error.message);
    }
  }
}

testRoutes();
