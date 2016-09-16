var ObjectId = require('mongodb').ObjectID;
var chai = require('chai'),
    expect = chai.expect,
    User = require('../../server/models/user_model.js'),
    LoginStatus = require('../../server/models/login_status_model.js'),
    Project = require('../../server/models/project_model.js'),
    Organization = require('../../server/models/org_role_model.js'),
    moment = require('moment'),
    async = require('async'),
    Generator = require('../utils/generator.js');

describe('Dashboard Tests', () => {

    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    var token = 'sample_auth_token', project, users, organization, orgName = 'default_org_name';
    mockgoose(mongoose);

    before((done) => {
        server = request(require('../../server/server.js'));
        async.waterfall([
            (callback) => {
                users = Generator.getUsers(5, {});
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
            },
            (callback) => {
                project = Generator.getProject('default_project', users, organization);
                Project.ProjectModel.create(project, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            }
        ], (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('should get the projects and organizations belonging to a user', function(done) {
        server.get('/api/dashboard/')
        .set({token : token})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body.projects.length).to.equal(1);
            expect(res.body.projects[0].metadata.name).to.equal('default_project');
            expect(res.body.organizations.length).to.equal(1);
            expect(res.body.organizations[0].name).to.equal(orgName);
            expect(res.body.organizations[0].members).to.be.instanceof(Array);
            done();
        });
    });

    after((done) => {
        mockgoose.reset();
        done();
    });
});