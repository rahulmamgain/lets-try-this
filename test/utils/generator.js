/**
 * Generates Objects For Various Models
 * @type {[type]}
 */
var User = require('../../server/models/user_model.js');
var Organization = require('../../server/models/org_role_model');
var Project = require('../../server/models/project_model');
var LoginStatus = require('../../server/models/login_status_model');
var Invite = require('../../server/models/invite_model');
var merge = require('merge');
var S = require('string');

/**
 * Returns a new User model Object
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports.getUsers = function(count, options) {
    var users = new Array();
    var defaultValues = {
        name : 'user_name_{{index}}',
        email : 'user_email_{{index}}@publish.com',
        password : 'password_{{index}}',
        createdAt : Date.now(),
        updatedAt : Date.now()
    };
    var objectValues = merge(defaultValues, options);
    for (var idx = 0; idx < count; idx++) {
        var user = new User.UserModel({
            email : S(objectValues.email).template({index : idx}).s,
            password : S(objectValues.password).template({index : idx}).s,
            name : S(objectValues.name).template({index : idx}).s
        });
        users.push(user);
    }
    return users;
};

/**
 * Generates And Returns A New Login Status Object
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports.getLoginStatus = function(options) {
    var defaultValues = {
        user : '12345',
        token : 'ABCD1234',
        createdAt : Date.now(),
        updatedAt : Date.now(),
        createdOn : Date.now()
    };
    var objectValues = merge(defaultValues, options);
    return new LoginStatus.LoginStatusModel(objectValues);
};

module.exports.getOrganization = function(options) {
    var orgMembers = [];

    var roleId = Math.floor(Math.random()*1000);

    var role = new Organization.RoleModel({
        roleId : roleId
    });

    if (options && options.members) {
        for (var idx=0; idx< options.members.length; idx++) {
            var orgMember = new Organization.OrgMemberModel({
                user : options.members[idx].id,
                role : role.id
            });
            orgMembers.push(orgMember);
        }
    }
    return new Organization.OrganizationModel({
        name : options.name,
        members :orgMembers,
        createdAt : Date.now(),
        updatedAt : Date.now()
    });
};


module.exports.getProject = function(name, members, organization, permissions) {
    var projectMembers = [];
    if (members) {
        for (var idx = 0; idx < members.length; idx++) {
            var projectMember = new Project.ProjectMemberModel({
                user : members[idx].id,
                createdAt : Date.now(),
                updatedAt : Date.now(),
                permissions : permissions || [1,2]
            });
            projectMembers.push(projectMember);
        }
    }
    return new Project.ProjectModel({
        metadata : {
            name : name,
            structure : {
                name : name,
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
        },
        organization : organization.id,
        members : projectMembers,
        createdAt : Date.now(),
        updatedAt : Date.now()
    });
};

module.exports.getInvite = function(projectId,organizationId,email) {
    
    return new Invite.InviteProjectModel({
        projectId : projectId,
        organizationId : organizationId,
        email : email
    });
};