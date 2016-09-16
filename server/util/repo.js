var fs = require('fs-extra');
var path = require('path');
var rmdir = require('rmdir');
var simpleGit = require('../opensource-lib/simple-git/src/index.js');
var repoDir = path.join(__dirname, '../../repos/');
var repoDefaultFilesDir = path.join(__dirname, '../repo-default-files/');
var defaultFile = 'default.html';
var mkdirp = require('mkdirp');

function initializeRepo(name,structure,author,cb) {

    var assets = 'assets';

    var chapter = structure.children[0];

    var makeChapterDir = makeDirectory(`${repoDir}${name}/${chapter.name}`);
  
    Promise.all([makeChapterDir])
        .then(function() {

            var copyAssets = copy(`${repoDefaultFilesDir}${assets}`,
                `${repoDir}${name}/${assets}`);
            
            var copyChapterFile = copy(`${repoDefaultFilesDir}${defaultFile}`,
                `${repoDir}${name}/${chapter.name}/${chapter.files[0].name}`);

            return Promise.all([copyChapterFile,copyAssets]);
        })
        .then(function() {
            var git = simpleGit(`${repoDir}${name}`);

            git.init((err) => {

                if (err) { return cb(err);}

                git.add('./*',(err) => {

                    if (err) { return cb(err);}
                    git.commit('initial commit',null,{'--author' : author},(err) => {
                        if (err) { return cb(err);}
                        cb(null);
                    });
                });
            });
        })
        .catch(function(err) {
            cb(err);
        });
}

function getFileContents(repoName,file,binary,cb) {

    if (arguments.length === 3) {
        cb = binary;
        binary = false;
    }

    var git = simpleGit(`${repoDir}${repoName}`);

    git.show([file],binary,(err,content) => {
        if (err) { return cb(err);}
        cb(null,content);
    }); 
}

function saveFile(repoName,file,content,author,cb) {

    fs.access(`${repoDir}${repoName}/${file}`, fs.W_OK, (err) => {
        if (!err) {
            fs.writeFile(`${repoDir}${repoName}/${file}`, content, (err) => {
                if (err) { 
                    err = (err.code === 'ENOENT') ? {message : 'File doesnt exist'} : 
                        {message : 'Error while saving file'};
                    return cb(err);
                } else {

                    var git = simpleGit(`${repoDir}${repoName}`);

                    git
                        .add(file,(err) => {

                            if (err) { return cb(err);}

                            var commit = 'Saved file '+ file;

                            git.commit(commit,null,{'--author' : author},(err) => {
                                if (err) { return cb(err);}
                                cb(null,{success : true});
                            });
                        });
                }

            }); 
        } else {
            cb(err);
            return;
        }
    });
}

function createFile(repoName,fileName,author,cb) {
    fs.readFile(`${repoDefaultFilesDir}${defaultFile}`,(err,data) => {
        if (err) {
            cb(err);
            return;
        } else {
            
            fs.writeFile(`${repoDir}${repoName}/${fileName}`, data, {flag : 'wx'},(err) => {
                if (err) { 
                    var message = (err.code === 'EEXIST') ? 'File already exists' : 
                        'Error while saving file';
                    err.message = message;
                    return cb(err);
                } else {

                    var git = simpleGit(`${repoDir}${repoName}`);

                    git
                        .add(fileName,(err) => {
                            if (err) { return cb(err);}
                            var commit = 'Created a new file '+ fileName;
                            git.commit(commit,null,{'--author' : author},(err) => {
                                if (err) { return cb(err);}
                                cb(null,{success : true});
                            });
                        });
                }

            });    
        }
    });
}

function deleteFile(repoName,file,author,cb) {
    
    fs.unlink(`${repoDir}${repoName}/${file}`,(err) => {

        if (err) { 
            err.message = 'Something went wrong';
            return cb(err);
        } else {
            var git = simpleGit(`${repoDir}${repoName}`);

            git
                .rm(file,(err) => {
                    if (err) { return cb(err);}
                    var commit = 'Deleted file '+ file;
                    git.commit(commit , null ,{'--author' : author},(err) => {
                        if (err) { return cb(err);}
                        cb(null,{success : true});
                    });
                });
        }

    });
}

function renameFile(repoName,filePath,newName,author,cb) {

    var filePathArr = filePath.split('/');
    filePathArr.pop();
    var fileDir = filePathArr.join('/');
    var oldFilePath = `${repoDir}${repoName}/${filePath}`;
    var newFilePath;

    if (fileDir) {
        newFilePath = `${repoDir}${repoName}/${fileDir}/${newName}`;
    } else {
        newFilePath = `${repoDir}${repoName}/${newName}`;
    }
    
    fs.rename(oldFilePath,newFilePath,(err) => {

        if (err) { 
            err.message = 'Something went wrong';
            return cb(err);
        } else {
            var git = simpleGit(`${repoDir}${repoName}`);

            git
                .add('./*',(err) => {
                    if (err) { return cb(err);}
                    git.rm(oldFilePath,(err) => {
                        git.commit('renamed',null,{'--author' : author},(err) => {
                            if (err) { return cb(err);}
                            cb(null,{success : true});
                        });
                    });
                });
        }

    });
}

function logRepo(name) {
    var git = simpleGit(`${repoDir}${name}`);
    git.log((err,data) => {
        //console.log(data);
    });
}


function makeDirectory(dir) {

    return new Promise(function(resolve,reject) {

        mkdirp(dir,(err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function deleteDirectory(dir) {

    return new Promise(function(resolve, reject) {

        rmdir(dir, function (err, dirs, files) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function copy(src,dest) {

    return new Promise(function(resolve,reject) {

        fs.copy(src,dest,(err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function createDirectory(repoName, directoryName, author, cb) {

    var makeChapterDir = makeDirectory(`${repoDir}${repoName}/${directoryName}`);
  
    Promise.all([makeChapterDir])
        .then(function() {
            var git = simpleGit(`${repoDir}${repoName}`);

            git.init((err) => {

                if (err) { return cb(err);}

                git.add('./*',(err) => {

                    if (err) { return cb(err);}
                    git.commit('initial commit', null, {'--author' : author}, (err) => {
                        if (err) { return cb(err);}
                        cb(null);
                    });
                });
            });
        })
        .catch(function(err) {
            cb(err);
        });
}

function removeDirectory(repoName, directoryName, author, cb) {

    var makeChapterDir = deleteDirectory(`${repoDir}${repoName}/${directoryName}`);
  
    Promise.all([makeChapterDir])
        .then(function() {
            var git = simpleGit(`${repoDir}${repoName}`);

            git.rm(directoryName, (err) => {
                if (err) { return cb(err);}
                var commit = 'Deleted folder '+ directoryName;
                git.commit(commit , null ,{'--author' : author},(err) => {
                    if (err) { return cb(err);}
                    cb(null,{success : true});
                });
            });
        })
        .catch(function(err) {
            cb(err);
        });
}


function createDirectory_WithoutCommit(repoName, directoryName, author, cb) {

    var makeChapterDir = makeDirectory(`${repoDir}${repoName}/${directoryName}`);
  
    Promise.all([makeChapterDir])     
        .then(function() {
            cb(null);
        })   
        .catch(function(err) {
            cb(err);
        });
}

function removeDirectory_WithoutCommit(repoName, directoryName, author, cb) {

    var makeChapterDir = deleteDirectory(`${repoDir}${repoName}/${directoryName}`);
  
    Promise.all([makeChapterDir])
        .then(function() {
            cb(null);
        })
        .catch(function(err) {
            cb(err);
        });
}

function createFile_WithoutCommit(repoName,filePath,author,cb) {
    fs.readFile(`${repoDefaultFilesDir}${defaultFile}`,(err,data) => {
        if (err) {
            cb(err);
            return;
        } else {
            
            fs.writeFile(`${repoDir}${repoName}/${filePath}`, data, {flag : 'wx'},(err) => {
                if (err) { 
                    var message = (err.code === 'EEXIST') ? 'File already exists' : 
                        'Error while creating file';
                    err.message = message;
                    return cb(err);
                } else {
                    cb(null,{success : true});
                }
            });    
        }
    });
}

function deleteFile_WithoutCommit(repoName,file,author,cb) {
    
    fs.unlink(`${repoDir}${repoName}/${file}`,(err) => {

        if (err) { 
            err.message = 'Something went wrong';
            return cb(err);
        } else {
            cb(null,{success : true});
        }
    });
}

function commit_repo(repoName, author, commitMessage, cb) {

    var git = simpleGit(`${repoDir}${repoName}`);
    commitMessage = commitMessage || 'commited';

    git.add('./*',(err) => {

        if (err) { return cb(err);}
        git.commit(commitMessage ,null,{'--author' : author},(err) => {
            if (err) { return cb(err);}
            cb(null);
        });
    });
}

module.exports = {
    initializeRepo,
    getFileContents,
    saveFile,
    createFile,
    deleteFile,
    renameFile,
    logRepo,
    createDirectory,
    removeDirectory,

    createDirectory_WithoutCommit,
    removeDirectory_WithoutCommit,
    createFile_WithoutCommit,
    deleteFile_WithoutCommit,
    commit_repo
};