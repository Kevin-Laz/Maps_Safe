const { writeFileSync } = require('fs');
const { MAPS_API_KEY } = process.env;

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `
  export const environment = {
    production: true,
    googleMapsApiKey: '${MAPS_API_KEY}'
  };
`;

writeFileSync(targetPath, envConfigFile);
