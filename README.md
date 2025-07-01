Share-a-meal API

RESTful API voor het creëren en beheren van maaltijden.

Functies:
- Registratie en inloggen met JWT
- CRUD voor gebruikers
- CRUD voor maaltijden
- Unit- en integratietests met Mocha en Chai

Technische stack:
- Node.js & Express
- MySQL
- JWT
- Mocha, Chai

Installatie:

cd mijn-api
npm install

Test:

cd mijn-api
npm test

Server start:

npm start

Link: https://share-a-meal-bhu4.onrender.com

API Endpoints:

Authenticatie

POST /api/register – registreer een nieuwe gebruiker

POST /api/login – log in en ontvang een JWT

Gebruikers (vereist JWT)

GET /api/user – haal alle gebruikers op (optioneel filter isActive)

GET /api/user/profile – haal je eigen profiel op

GET /api/user/:id – haal profiel van specifieke gebruiker op

PUT /api/user/:id – werk een gebruiker bij

DELETE /api/user/:id – verwijder een gebruiker

Maaltijden

POST /api/meal (vereist JWT) – creëer een nieuwe maaltijd

GET /api/meal – haal alle maaltijden op

GET /api/meal/:id – haal een maaltijd op basis van ID

PUT /api/meal/:id (vereist JWT) – werk een maaltijd bij

DELETE /api/meal/:id (vereist JWT) – verwijder een maaltijd