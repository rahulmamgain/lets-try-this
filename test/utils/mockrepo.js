module.exports = function(repo) {

    var org_getFileContents = repo.getFileContents;
    var org_saveFile = repo.saveFile;
    var org_createFile = repo.createFile;
    var org_deleteFile = repo.deleteFile;
    var org_initializeRepo = repo.initializeRepo;
    var org_createDirectory_WithoutCommit = repo.createDirectory_WithoutCommit;
    var org_removeDirectory_WithoutCommit = repo.removeDirectory_WithoutCommit;
    var org_createFile_WithoutCommit = repo.createFile_WithoutCommit;
    var org_deleteFile_WithoutCommit = repo.deleteFile_WithoutCommit;
    var org_commit_repo = repo.commit_repo;

    repo.getFileContents = function() {
        var cb = getTrailingFunctionArgument(arguments);
        cb(null,'["some file content"]');
    };

    repo.saveFile = function() {
        var cb = getTrailingFunctionArgument(arguments);
        cb(null,{success : true});
    };

    repo.createFile = function(repoName,filePath,author,cb) {
        cb(null,{success : true});
    };

    repo.deleteFile = function() {
        var cb = getTrailingFunctionArgument(arguments);
        cb(null,{success : true});
    };  

    repo.initializeRepo = function() {
        var cb = getTrailingFunctionArgument(arguments);
        cb(null,{success : true});
    };  

    repo.createDirectory_WithoutCommit = function(repoName, directoryName, author, cb) {
        cb(null);
    };  

    repo.removeDirectory_WithoutCommit = function(repoName, directoryName, author, cb) {
        cb(null);
    };  

    repo.createFile_WithoutCommit = function(repoName, fileName, author, cb) {
        cb(null,{success : true});
    };  

    repo.deleteFile_WithoutCommit = function(repoName, file, author, cb) {
        cb(null,{success : true});
    };  

    repo.commit_repo = function(repoName, author,commitMessage, cb) {
        cb(null);
    };

    module.exports.reset = function() {
        repo.getFileContents = org_getFileContents;
        repo.saveFile = org_saveFile;
        repo.createFile = org_createFile;
        repo.deleteFile = org_deleteFile;
        repo.initializeRepo = org_initializeRepo;
        repo.createDirectory_WithoutCommit = org_createDirectory_WithoutCommit;
        repo.removeDirectory_WithoutCommit = org_removeDirectory_WithoutCommit;
        repo.createFile_WithoutCommit = org_createFile_WithoutCommit;
        repo.deleteFile_WithoutCommit = org_deleteFile_WithoutCommit;
        repo.commit_repo = org_commit_repo;
    };

    function getTrailingFunctionArgument(args) {
        var trailing = args[args.length - 1];
        return (typeof trailing === 'function') ? trailing : null;
    }
};
