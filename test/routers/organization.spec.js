var chai = require('chai'),
    expect = chai.expect,
    User = require('../../server/models/user_model.js'),
    LoginStatus = require('../../server/models/login_status_model.js'),
    Organization = require('../../server/models/org_role_model.js'),
    async = require('async'),
    Generator = require('../utils/generator.js');

var server = null, request = require('supertest');
var mockgoose = require('mockgoose');
var mongoose = require('mongoose');

describe('Get Organization for a user', () => {

    var token = 'sample_auth_token',
        orgName = 'default_org_name',
        users,
        organization;

    before((done) => {

        mockgoose(mongoose);
        server = request(require('../../server/server.js'));

        async.waterfall([
            (callback) => {
                users = Generator.getUsers(1, {});
                User.UserModel.insertMany(users, (err, docs) => {
                    if (err) return callback(err);
                    users = docs;
                    callback(null);
                });
            },
            (callback) => {
                var loginStatus = Generator.getLoginStatus({
                    user : users[0].id,
                    token : token
                });
                LoginStatus.LoginStatusModel.create(loginStatus, (err) => {
                    if (err) return callback(err);
                    callback(null);
                });
            },
            (callback) => {
                organization = Generator.getOrganization({
                    members : users, 
                    name : orgName
                });

                Organization.OrganizationModel.create(organization, (err) => {
                    if (err) return callback(err);
                    callback(null);
                });
            }
        ], (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('should get list of organizations for a user', (done) => {

        server
            .get('/api/organization/')
            .set({token : token})
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.length).to.equal(1);
                expect(res.body[0].name).to.equal(orgName);
                done();
            });

    });

    it('should contain the fields for user and role', (done) => {

        server
            .get('/api/organization/')
            .set({token : token})
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.length).to.equal(1);
                expect(res.body[0].name).to.equal(orgName);
                expect(res.body[0].members[0].user.email).to.not.be.undefined;
                expect(res.body[0].members[0].role).to.not.be.undefined;
                done();
            });

    });

    after((done) => {
        mockgoose.reset();
        done();
    });
});
