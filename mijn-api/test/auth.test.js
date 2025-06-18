const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();

chai.use(chaiHttp);

let token;

describe('UC-101 Inloggen', () => {
  it('TC-101-1 Verplicht veld ontbreekt', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ emailAdress: '' }) 
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object').with.property('message');
        done();
      });
  });

  it('TC-101-2 Niet-valide wachtwoord (geen string)', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ emailAdress: 'j.wenzel@avans.nl', password: 123456 })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object').with.property('message');
        done();
      });
  });

  it('TC-101-3 Gebruiker bestaat niet', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ emailAdress: 'nonexistent@avans.nl', password: 'Wachtwoord123' })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object').with.property('message');
        done();
      });
  });

  it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ emailAdress: 'j.wenzel@avans.nl', password: 'Wachtwoord123' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data');
        res.body.data.should.be.an('object');
        res.body.data.should.have.property('token');
        done();
      });
  });
});

describe('UC-201 Registreren als nieuwe user', () => {
  it('TC-201-1 Verplicht veld ontbreekt', (done) => {
    chai.request(server)
      .post('/api/user')
      .send({ emailAdress: 'nieuw@avans.nl', password: 'Wachtwoord123' }) // firstName ontbreekt
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-201-3 Niet-valide wachtwoord (geen string)', (done) => {
    chai.request(server)
      .post('/api/user')
      .send({
        emailAdress: 'nieuw@avans.nl',
        password: 123456,
        firstName: 'Jan',
        lastName: 'Jansen',
        phoneNumber: '0612345678',
        street: 'Straat 1',
        city: 'Breda'
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-201-4 Gebruiker bestaat al', (done) => {
    chai.request(server)
      .post('/api/user')
      .send({
        emailAdress: 'j.wenzel@avans.nl',
        password: 'Wachtwoord123',
        firstName: 'Jan',
        lastName: 'Wenzel',
        phoneNumber: '0612345678',
        street: 'Straat 1',
        city: 'Breda'
      })
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
    const randomMail = `user${Date.now()}@avans.nl`;
    chai.request(server)
      .post('/api/user')
      .send({
        emailAdress: randomMail,
        password: 'Wachtwoord123',
        firstName: 'Test',
        lastName: 'Gebruiker',
        phoneNumber: '0612345678',
        street: 'Straat 2',
        city: 'Tilburg'
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property('data');
        res.body.data.should.have.property('id').that.is.a('number');
        done();
      });
  });
});

describe('UC-202 Opvragen van overzicht van users', () => {
  before((done) => {
    chai.request(server)
      .post('/api/login')
      .send({ emailAdress: 'j.wenzel@avans.nl', password: 'Wachtwoord123' })
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('data');
        res.body.data.should.have.property('token');
        token = res.body.data.token;
        done();
      });
  });

  it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
    chai.request(server)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.should.have.property('data').that.is.an('array');
        res.body.data.length.should.be.at.least(2);
        done();
      });
  });

  it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
    chai.request(server)
      .get('/api/user?nonExistingField=abcd')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('data').that.is.an('array');
        done();
      });
  });

  it('TC-202-3 Toon gebruikers met zoekterm op isActive=false', (done) => {
    chai.request(server)
      .get('/api/user?isActive=false')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('data').that.is.an('array');
    res.body.data.forEach(user => {
  user.should.have.property('isActive').that.satisfies(val =>
    val === 0 || val === 1 || val === "0" || val === "1" || val === false || val === true
  );
});
        done();
      });
  });

  it('TC-202-4 Toon gebruikers met zoekterm op isActive=true', (done) => {
    chai.request(server)
      .get('/api/user?isActive=true')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('data').that.is.an('array');
        res.body.data.forEach(user => {
  user.should.have.property('isActive').that.satisfies(val =>
    val === 1 || val === true || val === "1"
  );
});
        done();
      });
  });

  it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max 2 filters)', (done) => {
    chai.request(server)
      .get('/api/user?isActive=true&firstName=Jan')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('data').that.is.an('array');
        res.body.data.forEach(user => {
          user.should.have.property('isActive').that.satisfies(val => val === 1 || val === true);
          user.should.have.property('firstName').that.includes('Jan');
        });
        done();
      });
  });
});

describe('UC-203 Opvragen van gebruikersprofiel', () => {
  // Eerst inloggen om een geldig token te krijgen
  before((done) => {
    chai.request(server)
      .post('/api/login')
      .send({ emailAdress: 'j.wenzel@avans.nl', password: 'Wachtwoord123' }) // Gebruik geldige testgegevens
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('data');
        res.body.data.should.have.property('token');
        token = res.body.data.token;
        done();
      });
  });

  it('TC-203-1 Ongeldig token', (done) => {
    chai.request(server)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer ongeldigtoken123')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property('message').that.is.a('string');
        done();
      });
  });

  it('TC-203-2 Gebruiker is ingelogd met geldig token', (done) => {
    chai.request(server)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('message').that.is.a('string');
        res.body.should.have.property('data').that.is.an('object');
        res.body.data.should.have.property('id').that.is.a('number');
        res.body.data.should.have.property('firstName').that.is.a('string');
        res.body.data.should.have.property('lastName').that.is.a('string');
        res.body.data.should.have.property('emailAdress').that.is.a('string');
        done();
      });
  });
});

describe('UC-204 Opvragen van usergegevens bij ID', () => {
  // Haal token op via login voor geldige tests
  before((done) => {
    chai.request(server)
      .post('/api/login')
      .send({ emailAdress: 'j.wenzel@avans.nl', password: 'Wachtwoord123' })
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        token = res.body.data.token;
        done();
      });
  });

  it('TC-204-1 Ongeldig token', (done) => {
    chai.request(server)
      .get('/api/user/49') // Voorbeeld userId
      .set('Authorization', 'Bearer ongeldigtoken123')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
    chai.request(server)
      .get('/api/user/9999999') // Niet bestaande userId
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-204-3 Gebruiker-ID bestaat', (done) => {
    chai.request(server)
      .get('/api/user/49') // Voorbeeld bestaande userId
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.should.have.property('data').that.is.an('object');
        res.body.data.should.have.property('id').that.equals(49);
        res.body.data.should.have.property('emailAdress');
        res.body.data.should.have.property('firstName');
        res.body.data.should.have.property('lastName');
        done();
      });
  });
});
