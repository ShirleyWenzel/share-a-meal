const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index'); 
const should = chai.should();

chai.use(chaiHttp);

describe('UC-301 Toevoegen van maaltijd', () => {
  let token;

  before((done) => {
    // Inloggen om token te krijgen
    chai.request(server)
      .post('/api/login')
      .send({ emailAdress: 't.ester@example.com', password: 'Wachtwoord123' })
      .end((err, res) => {
        if (err) return done(err);
        token = res.body.data.token;
        done();
      });
  });

  it('TC-301-1 Verplicht veld ontbreekt', (done) => {
    // Naam ontbreekt bijvoorbeeld
    const mealMissingName = {
      description: "Dé pastaklassieker bij uitstek.",
      price: 6.75,
      dateTime: "2025-07-01T18:30:00Z",
      maxAmountOfParticipants: 6,
      imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg"
    };

    chai.request(server)
      .post('/api/meal')
      .set('Authorization', `Bearer ${token}`)
      .send(mealMissingName)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('TC-301-2 Niet ingelogd', (done) => {
    const validMeal = {
      name: "Spaghetti Bolognese",
      description: "Dé pastaklassieker bij uitstek.",
      price: 6.75,
      dateTime: "2025-07-01T18:30:00Z",
      maxAmountOfParticipants: 6,
      imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg"
    };

    chai.request(server)
      .post('/api/meal')
      // Geen Authorization header
      .send(validMeal)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
    const validMeal = {
      name: "Spaghetti Bolognese",
      description: "Dé pastaklassieker bij uitstek.",
      price: 6.75,
      dateTime: "2025-07-01T18:30:00Z",
      maxAmountOfParticipants: 6,
      imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg"
    };

    chai.request(server)
      .post('/api/meal')
      .set('Authorization', `Bearer ${token}`)
      .send(validMeal)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.status.should.equal(201);
        res.body.message.should.equal('Maaltijd succesvol aangemaakt');
        res.body.data.should.include.keys('id', 'name', 'description', 'price', 'dateTime', 'maxAmountOfParticipants', 'imageUrl');
        done();
      });
  });
});

describe('UC-302 Wijzigen van maaltijdsgegevens', () => {
  let token;
  let otherUserToken;
  let mealIdToUpdate;
  let otherMealId;
  let emailMainUser;
  let emailOtherUser;

  before((done) => {
    emailMainUser = `mainuser${Date.now()}@avans.nl`;
    emailOtherUser = `otheruser${Date.now()}@avans.nl`;

    // 1. Registreer en login hoofdgebruiker (eigenaar van maaltijd)
    chai.request(server)
      .post('/api/user')
      .send({
        emailAdress: emailMainUser,
        password: 'Wachtwoord123',
        firstName: 'Main',
        lastName: 'User',
        phoneNumber: '0612345678',
        street: 'Straat 1',
        city: 'Breda'
      })
      .end((err, res) => {
        if (err) return done(err);

        chai.request(server)
          .post('/api/login')
          .send({ emailAdress: emailMainUser, password: 'Wachtwoord123' })
          .end((err2, res2) => {
            if (err2) return done(err2);
            token = res2.body.data.token;

            // 2. Registreer en login andere gebruiker
            chai.request(server)
              .post('/api/user')
              .send({
                emailAdress: emailOtherUser,
                password: 'Wachtwoord123',
                firstName: 'Other',
                lastName: 'User',
                phoneNumber: '0698765432',
                street: 'Straat 2',
                city: 'Breda'
              })
              .end((err3, res3) => {
                if (err3) return done(err3);

                chai.request(server)
                  .post('/api/login')
                  .send({ emailAdress: emailOtherUser, password: 'Wachtwoord123' })
                  .end((err4, res4) => {
                    if (err4) return done(err4);
                    otherUserToken = res4.body.data.token;

                    // 3. Maak een maaltijd aan voor de hoofdgebruiker
                    chai.request(server)
                      .post('/api/meal')
                      .set('Authorization', `Bearer ${token}`)
                      .send({
                        name: 'Test Maaltijd',
                        description: 'Test beschrijving',
                        price: 10.5,
                        dateTime: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 uur in de toekomst
                        maxAmountOfParticipants: 5,
                        imageUrl: 'https://example.com/image.jpg'
                      })
                      .end((err5, res5) => {
                        if (err5) return done(err5);
                        mealIdToUpdate = res5.body.data.id;
                        done();
                      });
                  });
              });
          });
      });
  });

  it('TC-302-1 Verplicht veld ontbreekt', (done) => {
    chai.request(server)
      .put(`/api/meal/${mealIdToUpdate}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 20 }) // name ontbreekt, bijvoorbeeld
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('TC-302-2 Niet ingelogd', (done) => {
    chai.request(server)
      .put(`/api/meal/${mealIdToUpdate}`)
      .send({
        name: 'Nieuwe Naam',
        price: 20,
        maxAmountOfParticipants: 6
      })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('TC-302-3 Niet de eigenaar van de data', (done) => {
    chai.request(server)
      .put(`/api/meal/${mealIdToUpdate}`)
      .set('Authorization', `Bearer ${otherUserToken}`) // andere user
      .send({
        name: 'Nieuwe Naam',
        price: 20,
        maxAmountOfParticipants: 6
      })
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });

  it('TC-302-4 Maaltijd bestaat niet', (done) => {
    chai.request(server)
      .put('/api/meal/9999999') // niet bestaand id
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Nieuwe Naam',
        price: 20,
        maxAmountOfParticipants: 6
      })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
    chai.request(server)
      .put(`/api/meal/${mealIdToUpdate}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Nieuwe Naam',
        price: 20,
        maxAmountOfParticipants: 6
      })
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe('UC-303 Opvragen van alle maaltijden', () => {
  it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
    chai.request(server)
      .get('/api/meal')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.data.should.be.an('array');
        done();
      });
  });
});

describe('UC-304 Opvragen van maaltijd bij ID', () => {
  it('TC-304-1 Maaltijd bestaat niet', (done) => {
    chai.request(server)
      .get('/api/meal/9999999')  // id die niet bestaat
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
 
    chai.request(server)
      .get('/api/meal/1') // voorbeeld id; pas aan naar een bestaande maaltijd id
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.data.should.include.keys('id', 'name', 'description', 'price', 'dateTime', 'maxAmountOfParticipants', 'imageUrl', 'cook');
        done();
      });
  });
});
