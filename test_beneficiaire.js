const http = require('http');

const testData = {    nom: 'TestApresModif',
    prenom: 'Utilisateur',
    numero: '3333333333',
    discount: 50
  // On ne met volontairement pas telephone, email, dateNaissance, ville, adresse
  // pour tester que les champs NULL fonctionnent
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/beneficiaires',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', body);
    try {
      const parsedBody = JSON.parse(body);
      console.log('Parsed response:', parsedBody);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

console.log('Sending test data:', testData);
req.write(postData);
req.end();
