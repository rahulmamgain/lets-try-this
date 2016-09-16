/**
 * Constants File.
 */

module.exports = {
    ErrorMessages : {
        InvalidEmailId : 'Please Send A Valid Email Id',
        InvalidPassword : 'Password can not be empty',
        InvalidOrganizationName : 'Please enter a valid organisation name',
        InvalidEmailIdOrPassword : 'Invalid Email Id Or Password',
        InvalidAuthHeader : 'Please send a valid auth header',
        EmptyProjectName : 'Please enter project name',
        InvalidOrganizationSelection : 'Please select valid organisation. You do not belong to the organisation',
        InvalidProjectID : 'Please send a valid Project Id',
        InvalidProjectMemberAccess : 'User does no have access to add members to the project',
        InvalidProjectMemberID : 'One or more project member id is invalid. Please send valid Ids',
        DuplicateProjectMembers : 'One or more users have already been added to the project as member',
        UsersDoNotBelongToOrg : 'One or more users do not belong to the project organisation'
    },
    WebRoutes : {
        InviteNewMemberToProject : '/invite/:id/project',
        InviteExistingMemberToProject : '/invite/:id/project/interstitial'
    },
    Names : {
        ConfigDirName : 'assets/config',
        PatternsConfigName : 'patterns.json'
    }
};

