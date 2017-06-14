
var config = require("cau-hinh-ung-dung");

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tamSoatBenh');
 
var service = {};
 
service.thongTin = thongTin;

module.exports = service;
function thongTin(data) {
    var deferred = Q.defer();
    db.tamSoatBenh.findOne({key: data.key}, {data: 1}, function (err, dsBenh) {
        if (err) deferred.reject(err);
        
        deferred.resolve(dsBenh);
    });
    return deferred.promise;
}
