
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();

chai.use(chaiHttp);

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
