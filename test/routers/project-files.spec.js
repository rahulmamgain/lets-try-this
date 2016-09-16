
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
    Generator = require('../utils/generator.js'),
    token = 'sample_auth_token',
    repo = require('../../server/util/repo'),
    mockRepo = require('../utils/mockrepo.js'),
    project = null;

describe('Get File Content API Tests', () => {

    var server = null, 
        request = require('supertest'),
        mockgoose = require('mockgoose'),
        mongoose = require('mongoose');
    
    mockgoose(mongoose);

    before((done) => {
        mockRepo(repo);
        server = request(require('../../server/server.js'));
        initProject(done);
    });

    it('should get the file content for a valid request', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.get(`/api/project/${project.id}/file/${chapter}/${file}`)
        .set({token : token})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.text).to.a('string');
            done();
        });
    });

    it('should send an error for an invalid request', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;

        server.get(`/api/project/${project.id}/file/${chapter}/invalidfile`)
        .set({token : token})
        .expect(500)
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

describe('Update File Content API Tests', () => {

    var server = null, 
        request = require('supertest'),
        mockgoose = require('mockgoose'),
        mongoose = require('mongoose');
    
    mockgoose(mongoose);

    before((done) => {
        mockRepo(repo);
        server = request(require('../../server/server.js'));
        initProject(done);
    });

    it('should send an error if no content is sent in the request body', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.put(`/api/project/${project.id}/file/${chapter}/${file}`)
        .set({token : token})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.text).to.a('string');
            done();
        });
    });

    it('should send an error if the file is invalid', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.put(`/api/project/${project.id}/file/${chapter}/invalid`)
        .set({token : token})
        .send({content : 'mock update content'})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should update the file for a valid request', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.put(`/api/project/${project.id}/file/${chapter}/${file}`)
        .set({token : token})
        .send({content : 'mock update content'})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.text).to.a('string');
            done();
        });
    });

    after((done) => {
        mockRepo.reset();
        mockgoose.reset();
        done();
    });
});


describe('Rename File API Tests', () => {

    var server = null, 
        request = require('supertest'),
        mockgoose = require('mockgoose'),
        mongoose = require('mongoose');
    
    mockgoose(mongoose);

    before((done) => {
        mockRepo(repo);
        server = request(require('../../server/server.js'));
        initProject(done);
    });

    it('should send an error if no newName is sent in the request body', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.post(`/api/project/${project.id}/rename/file/${chapter}/${file}`)
        .set({token : token})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.text).to.a('string');
            done();
        });
    });

    it('should send an error if the file is invalid', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.post(`/api/project/${project.id}/rename/file/${chapter}/invalid`)
        .set({token : token})
        .send({newName : 'mockNewName'})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should rename the file for a valid request', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.post(`/api/project/${project.id}/rename/file/${chapter}/${file}`)
        .set({token : token})
        .send({newName : 'mockNewName'})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('name');
            expect(res.body).to.have.property('children');
            done();
        });
    });

    after((done) => {
        mockRepo.reset();
        mockgoose.reset();
        done();
    });
});

describe('Delete File Content API Tests', () => {

    var server = null, 
        request = require('supertest'),
        mockgoose = require('mockgoose'),
        mongoose = require('mongoose');
    
    mockgoose(mongoose);

    before((done) => {
        mockRepo(repo);
        server = request(require('../../server/server.js'));
        initProject(done);
    });

    it('should send an error if the file is invalid', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.delete(`/api/project/${project.id}/file/${chapter}/invalid`)
        .set({token : token})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should delete the file for a valid request', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[1].name;

        server.delete(`/api/project/${project.id}/file/${chapter}/${file}`)
        .set({token : token})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('name');
            expect(res.body).to.have.property('children');
            done();
        });
    });

    after((done) => {
        mockRepo.reset();
        mockgoose.reset();
        done();
    });
});

describe('Create New File API Tests', () => {

    var server = null, 
        request = require('supertest'),
        mockgoose = require('mockgoose'),
        mongoose = require('mongoose');
    
    mockgoose(mongoose);

    before((done) => {
        mockRepo(repo);
        server = request(require('../../server/server.js'));
        initProject(done);
    });

    it('should send an error if the chapter is invalid', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.post(`/api/project/${project.id}/file/invalid/${file}`)
        .set({token : token})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should send an error if the the file already exists', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.post(`/api/project/${project.id}/file/${chapter}/${file}`)
        .set({token : token})
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should create the file for a valid request', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;

        server.post(`/api/project/${project.id}/file/${chapter}/newFile`)
        .set({token : token})
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('name');
            expect(res.body).to.have.property('children');
            done();
        });
    });

    after((done) => {
        mockRepo.reset();
        mockgoose.reset();
        done();
    });
});

describe('Update project file structure API Tests', () => {

    var server = null, 
        request = require('supertest'),
        mockgoose = require('mockgoose'),
        mongoose = require('mongoose');
    
    mockgoose(mongoose);

    before((done) => {
        mockRepo(repo);
        server = request(require('../../server/server.js'));
        initProject(done);
    });

    it('should send an error if the request body is empty', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        server.put(`/api/project/${project.id}/structure/`)
        .set({token : token})
        .expect(400)
        .send()
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should send an error if a new chapter is already present in the existing structure', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        var reqBody = {
            new : {
                chapters : [
                    {
                        name : 'Chapter-1'
                    }
                ]
            },
            delete : {},
            newStructure : {
                name : structure.name,
                children : [
                    {
                        name : 'Chapter-1',
                        title : 'Chapter 1',
                        files : [{
                            name : 'default.html',
                            title : 'default'
                        },{
                            name : 'default2.html',
                            title : 'default2'
                        }]
                    }
                ]
                
            }
        };

        server.put(`/api/project/${project.id}/structure/`)
        .set({token : token})
        .send(reqBody)
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should send an error if a new file does not have a valid chapter', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        var reqBody = {
            new : {
                files : [
                    {
                        chapterName : 'Chapter-11',
                        fileName : 'dwdwdwdw'
                    }
                ]
            },
            delete : {},
            newStructure : {
                name : structure.name,
                children : [
                    {
                        name : 'Chapter-1',
                        title : 'Chapter 1',
                        files : [{
                            name : 'default.html',
                            title : 'default'
                        },{
                            name : 'default2.html',
                            title : 'default2'
                        }]
                    }
                ]
                
            }
        };

        server.put(`/api/project/${project.id}/structure/`)
        .set({token : token})
        .send(reqBody)
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should send an error if a new file already exists in the existing structure', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        var reqBody = {
            new : {
                files : [
                    {
                        chapterName : 'Chapter-1',
                        fileName : 'default.html'
                    }
                ]
            },
            delete : {},
            newStructure : {
                name : structure.name,
                children : [
                    {
                        name : 'Chapter-1',
                        title : 'Chapter 1',
                        files : [{
                            name : 'default.html',
                            title : 'default'
                        },{
                            name : 'default2.html',
                            title : 'default2'
                        }]
                    }
                ]
                
            }
        };

        server.put(`/api/project/${project.id}/structure/`)
        .set({token : token})
        .send(reqBody)
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should send an error if a deleted chapter does not exist in the existing structure', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        var reqBody = {
            new : {
                
            },
            delete : {
                chapters : [{
                    name : 'error-chapter'
                }]
            },
            newStructure : {
                name : structure.name,
                children : [
                    {
                        name : 'Chapter-1',
                        title : 'Chapter 1',
                        files : [{
                            name : 'default.html',
                            title : 'default'
                        },{
                            name : 'default2.html',
                            title : 'default2'
                        }]
                    }
                ]
                
            }
        };

        server.put(`/api/project/${project.id}/structure/`)
        .set({token : token})
        .send(reqBody)
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    
    it('should send an error if any chapter have no files', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        var reqBody = {
            new : {
            },
            delete : {},
            newStructure : {
                name : structure.name,
                children : [
                    {
                        name : 'Chapter-1',
                        title : 'Chapter 1'
                    }
                ]
                
            }
        };

        server.put(`/api/project/${project.id}/structure/`)
        .set({token : token})
        .send(reqBody)
        .expect(500)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });

    it('should update project file structure for a valid request', function(done) {

        var structure = project.metadata.structure;
        var chapter = structure.children[0].name;
        var file = structure.children[0].files[0].name;

        var reqBody = {
            new : {
                chapters : [
                    {
                        name : 'Chapter-2'
                    }
                ]
            },
            delete : {
                chapters : [{
                    name : 'Chapter-1'
                }]
            },
            newStructure : {
                name : structure.name,
                children : [
                    {
                        name : 'Chapter-2',
                        title : 'Chapter 2',
                        files : [{
                            name : 'new.html',
                            title : 'untitled chapter'
                        }]
                    }
                ]
                
            }
        };

        server.put(`/api/project/${project.id}/structure/`)
        .set({token : token})
        .send(reqBody)
        .expect(200)
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


function initProject(done) {

    var users, organization, orgName = 'default_org_name';

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
}
