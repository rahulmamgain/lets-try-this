/**
 * tests Login And Register APIs
 */

var chai = require('chai'),
    expect = chai.expect,
    User = require('../../server/models/user_model.js'),
    LoginStatus = require('../../server/models/login_status_model.js'),
    moment = require('moment');

describe('Register Tests', () => {
    var server = null, request = require('supertest');
    var mongoose = require('mongoose');
    var mockgoose = require('mockgoose');
    mockgoose(mongoose);

    before(function(done) {
        server = request(require('../../server/server.js'));
        done();
    });

    it('Should Allow User To Register If All Params Are Fine', (done) => {
        server
        .post('/api/auth/register')
        .send({emailId : 'abc@gmail.com', password:'abcd', organizationName : 'ABC Org'})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(err).to.equal(null);
            expect(res.body.name).to.equal('ABC Org');
            expect(res.body.members[0].role.roleId).to.equal(1);
            expect(res.body.members[0].user.email).to.equal('abc@gmail.com');
            done();
        });
    });

    it('Should Not Requests With No Email Id', (done) => {
        mockgoose.reset();
        server
        .post('/api/auth/register')
        .send({ password:'abcd', organizationName : 'ABC Org'})
        .expect(500)
        .end((err, res) => {
            done();
        });
    });

    it('Should Not Requests With No Organization Name', (done) => {
        mockgoose.reset();
        server
        .post('/api/auth/register')
        .send({emailId : 'abc@gmail.com', password:'abcd'})
        .expect(500)
        .end((err, res) => {
            done();
        });
    });

    it('Should Not Requests With No Password', (done) => {
        mockgoose.reset();
        server
        .post('/api/auth/register')
        .send({emailId : 'abc@gmail.com',organizationName : 'ABC Org'})
        .expect(500)
        .end((err, res) => {
            done();
        });
    });
});


describe('Login Tests' , () => {
    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);

    before(function(done) {
        server = request(require('../../server/server.js'));
        done();
    });

    beforeEach((done) => {
        mockgoose.reset();
        var user = new User.UserModel({email : 'abc@gmail.com', password:'abcd'});
        User.UserModel.create(user, (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('Should Not Allow User With Invalid Email Id To Login', (done) => {
        server.post('/api/auth/login')
        .send({emailId : 'abcd@gmail.com', password:'abcd'})
        .expect(401)
        .end((err, res) => {
            done();
        });
    });

    it('Should Not Allow User With Invalid password Id To Login', (done) => {
        server.post('/api/auth/login')
        .send({emailId : 'abc@gmail.com', password:'abcde'})
        .expect(401)
        .end((err, res) => {
            done();
        });
    });

    it('Should Allow Login With A Valid Email Id And Pasword', (done) => {
        server.post('/api/auth/login')
        .send({emailId : 'abc@gmail.com', password:'abcd'})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(err).to.equal(null);
            expect(res.body.token).to.not.equal(null);
            expect(res.body.user.email).to.equal('abc@gmail.com');
            expect(res.body.user.password).to.equal(undefined);
            done();
        });
    });
});


describe('Logout Tests' , () => {
    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);

    before(function(done) {
        server = request(require('../../server/server.js'));
        done();
    });

    beforeEach((done) => {
        mockgoose.reset();
        var user = new User.UserModel({email : 'abc@gmail.com', password:'abcd'});
        User.UserModel.create(user, (err) => {
            if (err) return done(err);
        });

        var session = new LoginStatus.SessionModel({
            ip : '123456',
            userAgent : 'Android'
        });

        var loginStatus = new LoginStatus.LoginStatusModel({
            user : user.id,
            token : '456789123',
            createdOn : moment().toDate(),
            session : session
        });

        LoginStatus.LoginStatusModel.create(loginStatus, (err, loginStatus) => {
            if (err) return done(err);
            done();
        });
    });

    it('Should Delete Login Status For a valid auth token', (done) => {
        server.post('/api/auth/logout')
        .set({token : '456789123'})
        .send({emailId : 'abcd@gmail.com', password:'abcd'})
        .expect(204)
        .end((err, res) => {
            if (err) return done(err);
            LoginStatus.LoginStatusModel.findOne({token : '456789123'}, (err, loginStatus) => {
                if (err) return done(err);
                if (loginStatus) {
                    return done({
                        message : 'Login status should have been deleted',
                        loginStatus : loginStatus
                    });
                } else {
                    done();
                }
            });
            
        });
    });


    it('Should not allow a request with no auth token', (done) => {
        server.post('/api/auth/logout')
        .set({token : ''})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });
});