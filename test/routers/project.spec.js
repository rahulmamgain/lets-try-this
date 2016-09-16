
var ObjectId = require('mongodb').ObjectID;
var chai = require('chai'),
    expect = chai.expect,
    User = require('../../server/models/user_model.js'),
    LoginStatus = require('../../server/models/login_status_model.js'),
    Project = require('../../server/models/project_model.js'),
    Invite = require('../../server/models/invite_model.js'),
    Organization = require('../../server/models/org_role_model.js'),
    moment = require('moment'),
    async = require('async'),
    repo = require('../../server/util/repo'),
    mockRepo = require('../utils/mockrepo.js'),
    Generator = require('../utils/generator.js');

describe('Get All Projects API Tests', () => {
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

    it('should get all projects if there is only one project', function(done) {
        server.get('/api/project/')
        .set({token : token})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body.docs).to.not.equal(null);
            expect(res.body.total).to.equal(1);
            expect(res.body.pages).to.equal(1);
            expect(res.body.docs.length).to.equal(1);
            done();
        });
    });

    it('should only get the projects that belong to a particular user', function(done) {
        var projects = [];
        var tempProject = project.toJSON();
        tempProject._id = null;
        tempProject.members = null;
        Project.ProjectModel.create(projects, (err, docs) => {
            if (err) return done(err);
            server.get('/api/project/')
            .set({token : token})
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.docs).to.not.equal(null);
                expect(res.body.total).to.equal(1);
                expect(res.body.pages).to.equal(1);
                expect(res.body.docs.length).to.equal(1);
                done();
            });
        });
    });

    after((done) => {
        mockgoose.reset();
        done();
    });
});

describe('Pagination Tests Project', () => {
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
            },
            (callback) => {
                var tempProject = project.toJSON();
                tempProject._id = null;
                var projects = [];
                for (var idx=0; idx < 50 ; idx++) {
                    projects.push(tempProject);
                }
                Project.ProjectModel.insertMany(projects, (err, docs) => {
                    if (err) return callback(err);
                    callback(null);
                });
            }
        ], (err) => {
            if (err) return done(err);
            done();
        });
    });


    it('Should Fetch Paginated results', (done) => {
        Project.ProjectModel.find({}, (err, docs) => {
            server.get('/api/project')
            .set({token : token})
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.docs).to.not.equal(null);
                expect(res.body.total).to.equal(51);
                expect(res.body.pages).to.equal(6);
                expect(res.body.docs.length).to.equal(10);
                done();
            });
        });
        
    });

    it('Should consider limit and page as a param', (done) => {
        server.get('/api/project/')
        .set({token : token})
        .query({limit : 20, page : 2})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body.docs).to.not.equal(null);
            expect(res.body.total).to.equal(51);
            expect(res.body.pages).to.equal(3);
            expect(res.body.docs.length).to.equal(20);
            done();
        });
    });

    it('Should consider not throw an error for an invalid page', (done) => {
        server.get('/api/project/')
        .set({token : token})
        .query({limit : 20, page : 10})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body.total).to.equal(51);
            expect(res.body.pages).to.equal(3);
            expect(res.body.docs.length).to.equal(0);
            done();
        });
    });

    after((done) => {
        mockgoose.reset();
        done();
    });
});


describe('Get Projects By Id', () => {
    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    var token = 'sample_auth_token', project, users, organization, orgName = 'default_org_name';
    mockgoose(mongoose);
    before((done) => {
        mockRepo(repo);
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

    it('should get Project By Id', function(done) {
        server.get('/api/project/'+ project.id)
        .set({token : token})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            expect(res.body.members.length).to.equal(5);
            done();
        });
    });

    it('Should Not Allow A User Not Access a non eligible project when getting by id', function(done) {
        //create new user and login that user
        async.waterfall([
            (callback) => {
                //Create A new User
                var user = new User.UserModel({
                    email : 'totally_new_user@mail.com',
                    password : 'totally_real_password'
                });
                User.UserModel.create(user, (err) => {
                    if (err)
                        return callback(err);
                    return callback(null, user);
                });
            },
            (user, callback) => {
                //Login That User
                var session = new LoginStatus.SessionModel({
                    ip : 'welp_an_ip',
                    userAgent : 'welp_a_user_agent'
                });
                var loginStatus = new LoginStatus.LoginStatusModel({
                    user : user.id,
                    token : 'some_invalid_token',
                    createdOn : moment().toDate(),
                    session : session
                });
                LoginStatus.LoginStatusModel.create(loginStatus, (err, loginStatus) => {
                    if (err) {
                        return callback(err);
                    }
                    loginStatus = loginStatus.toJSON();
                    loginStatus.user = user;
                    callback(null, loginStatus);
                });
            }
        ],(err, loginStatus) => {
            if (err) return done(err);
            server.get('/api/project/'+ project.id)
            .set({token : loginStatus.token})
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
        });
    });

    after((done) => {
        mockRepo.reset();
        mockgoose.reset();
        done();
    });
});


describe('Create Project Tests', () => {
    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    var token = 'sample_auth_token', project, users, organization, organization2, orgName = 'default_org_name';
    mockgoose(mongoose);
    before((done) => {
        mockRepo(repo);
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

                Organization.OrganizationModel.create(organization, (err, docs) => {
                    if (err) return callback(err);
                    organization = docs;
                    callback(null);
                });
            },
            (callback) => {
                organization2 = Generator.getOrganization({
                    members : users[1], 
                    name : orgName
                });

                Organization.OrganizationModel.create(organization2, (err, docs) => {
                    if (err) return callback(err);
                    organization2 = docs;
                    callback(null);
                });
            }
        ], (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('Should Not Requests With No Project Name', function(done) {
        server.post('/api/project/')
        .set({token : token})
        .send({ name : '', orgId : 'default_org_id'})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('Should Not Requests With No Organization Id', function(done) {
        server.post('/api/project/')
        .set({token : token})
        .send({ name : 'default_project_name', orgId : ''})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('Should Not Requests With No Organization Id And Project Name', function(done) {
        server.post('/api/project/')
        .set({token : token})
        .send({ name : '', orgId : ''})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });
     
    it('Should Create New Project', function(done) {
        server.post('/api/project/')
        .set({ token : token })
        .send({ name : 'My new Project', orgId : organization.id })
        .expect(201)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });
     
    it('Should Create New Project With Duplicate Project Name', function(done) {
        server.post('/api/project/')
        .set({ token : token })
        .send({ name : 'My new Project', orgId : organization.id })
        .expect(201)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });
     
    it('Should Not Create New Project For User Of Other Organization', function(done) {
        server.post('/api/project/')
        .set({ token : token })
        .send({ name : 'My new Project', orgId : organization2.id })
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    after((done) => {
        mockRepo.reset();
        mockgoose.reset();
        done();
    });
});

describe('Get Project Members Tests', () => {
    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    var token = 'sample_auth_token', project, users, organization, loginStatus2, project2, orgName = 'default_org_name';
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
                var loginStatus2 = Generator.getLoginStatus({
                    user : users[1].id,
                    token : token
                });
                LoginStatus.LoginStatusModel.create(loginStatus2, (err) => {
                    if (err) return callback(err);
                    callback(null);
                });
            },
            (callback) => {
                organization = Generator.getOrganization({
                    members : users, 
                    name : orgName
                });

                Organization.OrganizationModel.create(organization, (err, docs) => {
                    if (err) return callback(err);
                    organization = docs;
                    callback(null);
                });
            },
            (callback) => {
                project = Generator.getProject('default_project', users, organization, [1]);
                Project.ProjectModel.create(project, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            },
            (callback) => {
                project2 = Generator.getProject('default_project', users, organization, [2]);
                Project.ProjectModel.create(project2, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            }
        ], (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('should get Project members By project Id', function(done) {
        server.get('/api/project/'+ project.id + '/members/')
        .set({token : token})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            expect(res.body.members).to.not.be.undefined;
            done();
        });
    });

    it('Should Not Allow A User Not Access project member details due to lack of permissions when getting by id', function(done) {
        server.get('/api/project/'+ project2.id + '/members/')
            .set({token : token})
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                expect(Object.keys(res.body).length).to.equal(0);
                done();
            });
    });

    it('Should Not Allow A User Not Access a non eligible project details when getting by id', function(done) {
        //create new user and login that user
        async.waterfall([
            (callback) => {
                //Create A new User
                var user = new User.UserModel({
                    email : 'totally_new_user@mail.com',
                    password : 'totally_real_password'
                });
                User.UserModel.create(user, (err) => {
                    if (err)
                        return callback(err);
                    return callback(null, user);
                });
            },
            (user, callback) => {
                //Login That User
                var session = new LoginStatus.SessionModel({
                    ip : 'welp_an_ip',
                    userAgent : 'welp_a_user_agent'
                });
                var loginStatus = new LoginStatus.LoginStatusModel({
                    user : user.id,
                    token : 'some_invalid_token',
                    createdOn : moment().toDate(),
                    session : session
                });
                LoginStatus.LoginStatusModel.create(loginStatus, (err, loginStatus) => {
                    if (err) {
                        return callback(err);
                    }
                    loginStatus = loginStatus.toJSON();
                    loginStatus.user = user;
                    callback(null, loginStatus);
                });
            }
        ],(err, loginStatus) => {
            if (err) return done(err);
            server.get('/api/project/'+ project.id+'/members/')
            .set({token : loginStatus.token})
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                expect(Object.keys(res.body).length).to.equal(0);
                done();
            });
        });
    });

    after((done) => {
        mockgoose.reset();
        done();
    });
});

describe('Add Project Members Tests', () => {
    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    var token = 'sample_auth_token', project, project2, users, moreUsers, organization, organization2, orgName = 'default_org_name';
    mockgoose(mongoose);
    before((done) => {
        server = request(require('../../server/server.js'));
        async.waterfall([
            (callback) => {
                users = Generator.getUsers(4, {});
                moreUsers = Generator.getUsers(2, {});
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
                    members : [users[0], users[1], users[2]], 
                    name : orgName
                });

                Organization.OrganizationModel.create(organization, (err, docs) => {
                    if (err) return callback(err);
                    organization = docs;
                    callback(null);
                });
            },
            (callback) => {
                organization2 = Generator.getOrganization({
                    members : [users[3]], 
                    name : orgName
                });

                Organization.OrganizationModel.create(organization2, (err, docs) => {
                    if (err) return callback(err);
                    organization2 = docs;
                    callback(null);
                });
            },
            (callback) => {
                project = Generator.getProject('default_project', [users[0]], organization, [1]);
                Project.ProjectModel.create(project, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            },
            (callback) => {
                project2 = Generator.getProject('default_project', [users[0]], organization, [2]);
                Project.ProjectModel.create(project2, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            }
        ], (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('should not request when request body is empty', function(done) {
        server.post('/api/project/'+ project.id + '/members/')
        .set({token : token})
        .send()
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('should not request when user list is empty', function(done) {
        server.post('/api/project/'+ project.id + '/members/')
        .set({token : token})
        .send({users : []})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('should not request when project id is invalid', function(done) {
        server.post('/api/project/aaaaaaaaaaaaaaaaaaaaaaaa/members/')
        .set({token : token})
        .send({users : [{user : users[1].id, permissions : [1,2]}]})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('should not request when user ids are invalid', function(done) {
        server.post('/api/project/'+ project.id + '/members/')
        .set({token : token})
        .send({users : [{user : moreUsers[0].id, permissions : [1,2]}]})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('should not add the new member to the project as user do not have admin access', function(done) {
        server.post('/api/project/'+ project2.id + '/members/')
        .set({token : token})
        .send({users : [{user : users[2].id, permissions : [1,2]}]})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('should not request when user id is sent, who is already a member of the project', function(done) {
        server.post('/api/project/'+ project.id + '/members/')
        .set({token : token})
        .send({users : [{user : users[0].id, permissions : [1,2]}]})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('should not add the new member to the project, as new member does not belong to project organization', function(done) {
        server.post('/api/project/'+ project.id + '/members/')
        .set({token : token})
        .send({users : [{user : users[3].id, permissions : [1,2]}]})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            done();
        });
    });

    it('should add the new member to the project', function(done) {
        server.post('/api/project/'+ project.id + '/members/')
        .set({token : token})
        .send({users : [{id : users[2].id, permissions : [1,2]}]})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.not.equal(null);
            expect(res.body.members).to.not.be.undefined;
            done();
        });
    });

    after((done) => {
        mockgoose.reset();
        done();
    });
});

describe('Accept invitation Tests', () => {
    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    var emailId = 'kulkarni.anik111@gmail.com';
    var token = 'sample_auth_token', invite,invite2,invite3,project, users, organization, loginStatus2, project2, orgName = 'default_org_name';
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
                var loginStatus2 = Generator.getLoginStatus({
                    user : users[1].id,
                    token : token
                });
                LoginStatus.LoginStatusModel.create(loginStatus2, (err) => {
                    if (err) return callback(err);
                    callback(null);
                });
            }, 

            (callback) => {
                var roles = [
                    {'roleId' : 1, 'roleLabel': 'Owner'},
                    {'roleId' : 2, 'roleLabel': 'Admin'}
                ];

                Organization.RoleModel.insertMany(roles, (err, docs) => {
                    if (err) {
                        console.log('Error while creating roles');
                        callback(err);
                    }
                    else {
                        callback(null);
                    }
                });
            },
            (callback) => {
                organization = Generator.getOrganization({
                    members : users, 
                    name : orgName
                });

                Organization.OrganizationModel.create(organization, (err, docs) => {
                    if (err) return callback(err);
                    organization = docs;
                    callback(null);
                });
            },
            (callback) => {
                project = Generator.getProject('default_project', [users[0]], organization, [1]);
                Project.ProjectModel.create(project, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            },
            (callback) => {
                invite = Generator.getInvite(project.id,organization.id,emailId);
                Invite.InviteProjectModel.create(invite, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            },
            (callback) => {
                invite2 = Generator.getInvite(project.id,organization.id,users[0].email);
                Invite.InviteProjectModel.create(invite2, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            },
            (callback) => {
                invite3 = Generator.getInvite(project.id,organization.id,users[1].email);
                Invite.InviteProjectModel.create(invite3, (err) => {
                    if (err) return callback(err);
                    callback(null);
                }); 
            }
        ], (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('throw an error for invalid invite id', function(done) {
        server.post('/api/project/invite/12345612345/accept/')
        .set({token : token})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);            
            done();
        });
    });

    it('should not accept the invite for a new user when no password is sent', function(done) {
        server.post(`/api/project/invite/${invite.id.toString()}/accept/`)
        .set({token : token})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);            
            done();
        });
    });

    it('should accept the invite for a new user when  password is sent', function(done) {
        server.post(`/api/project/invite/${invite.id.toString()}/accept/`)
        .set({token : token})
        .send({ password:'abcd1234'})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);            
            done();
        });
    });

    it('should not accept the invite for an existing member of project', function(done) {
        server.post(`/api/project/invite/${invite2.id.toString()}/accept/`)
        .set({token : token})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);            
            done();
        });
    });

    it('should accept the invite for an registered user without password', function(done) {
        server.post(`/api/project/invite/${invite3.id.toString()}/accept/`)
        .set({token : token})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);            
            done();
        });
    });

    after((done) => {
        mockgoose.reset();
        done();
    });
});

describe('Invite Members Tests', () => {
    var server = null, request = require('supertest');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    var emailId = 'kulkarni.anik111@gmail.com';
    var token = 'sample_auth_token', project, users, organization, loginStatus2, project2, orgName = 'default_org_name';
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
                var loginStatus2 = Generator.getLoginStatus({
                    user : users[1].id,
                    token : token
                });
                LoginStatus.LoginStatusModel.create(loginStatus2, (err) => {
                    if (err) return callback(err);
                    callback(null);
                });
            }, 

            (callback) => {
                var roles = [
                    {'roleId' : 1, 'roleLabel': 'Owner'},
                    {'roleId' : 2, 'roleLabel': 'Admin'}
                ];

                Organization.RoleModel.insertMany(roles, (err, docs) => {
                    if (err) {
                        console.log('Error while creating roles');
                        callback(err);
                    }
                    else {
                        callback(null);
                    }
                });
            },
            (callback) => {
                organization = Generator.getOrganization({
                    members : users, 
                    name : orgName
                });

                Organization.OrganizationModel.create(organization, (err, docs) => {
                    if (err) return callback(err);
                    organization = docs;
                    callback(null);
                });
            },
            (callback) => {
                project = Generator.getProject('default_project', [users[0]], organization, [1]);
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

    it('send an error for a invalidvalid request', function(done) {
        server.post(`/api/project/${project.id.toString()}/invite/`)
        .set({token : token})
        .send({members : [{email : 'abc'}]})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);            
            done();
        });
    });

    it('send the invite for a valid request', function(done) {
        server.post(`/api/project/${project.id.toString()}/invite/`)
        .set({token : token})
        .send({members : [{email : emailId}]})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);            
            done();
        });
    });

    after((done) => {
        mockgoose.reset();
        done();
    });
});
