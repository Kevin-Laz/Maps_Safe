#!/bin/bash
echo "Inyectando la clave de API en environment.prod.ts..."

echo "export const environment = {
  production: true,
  googleMapsApiKey: '${MAPS_API_KEY}'
};" > src/environments/environment.prod.ts

