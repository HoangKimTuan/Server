
var config = require("cau-hinh-ung-dung");

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('nguoiDung');
 
var service = {};
 
service.chungThuc = chungThuc;
service.timBangId = timBangId;
service.dsNguoiDung = dsNguoiDung;
service.taoNguoiDung = taoNguoiDung;
service.capNhatNguoiDung = capNhatNguoiDung;
service.xoaNguoiDung = _xoaNguoiDung;
 
module.exports = service;
 
function chungThuc(username, password, type) {
    var deferred = Q.defer();
    db.nguoiDung.findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err);
        
        if (user && bcrypt.compareSync(password, user.hash) && user.type == type) {
            // authentication successful
            deferred.resolve({_id: user._id, type: user.type});
        } else {
            // authentication failed
            deferred.reject({});
        }
    });
 
    return deferred.promise;
} 

function dsNguoiDung(condition) {
    var deferred = Q.defer();
 
    db.nguoiDung.find(condition, function (err, nguoiDung) {
        if (err) deferred.reject(err);

        deferred.resolve(nguoiDung.toArray());
    });
 
    return deferred.promise;
}
 
function timBangId(_id) {
    var deferred = Q.defer();
 
    db.nguoiDung.findById(_id, function (err, user) {
        if (err) deferred.reject(err);
 
        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });
 
    return deferred.promise;
}
 
function taoNguoiDung(userParam) {
    var deferred = Q.defer();
 
    // validation
    db.nguoiDung.findOne(
        { username: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err);
 
            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser();
            }
        });
 
    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');
 
        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);
        user.name = "Username";
 
        db.nguoiDung.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err);
                
                deferred.resolve();
            });
    }
    
    return deferred.promise;
}
 
function capNhatNguoiDung(_id, userParam) {
    var deferred = Q.defer();
 
    // validation
    db.nguoiDung.findById(_id, function (err, user) {
        if (err) deferred.reject(err);
 
        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.nguoiDung.findOne(
                { username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err);
 
                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + req.body.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });
 
    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
        };
 
        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }
 
        db.nguoiDung.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err);
 
                deferred.resolve();
            });
    }
 
    return deferred.promise;
}
 
// prefixed function name with underscore because 'delete' is a reserved word in javascript
function _xoaNguoiDung(_id) {
    var deferred = Q.defer();
 
    db.nguoiDung.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}
