
var config = require("cau-hinh-ung-dung");

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('thuoc');
 
var service = {};
 
service.danhSachThuoc = danhSachThuoc;
service.timThuoc = timThuoc;
service.chiTietThuoc = chiTietThuoc;
service.capNhatThuoc = capNhatThuoc;

module.exports = service;
function danhSachThuoc() {
    var deferred = Q.defer();
    db.thuoc.find({}, {ten_thuoc: 1}).skip(0).limit(100)
        .toArray(function (err, dsthuoc) {
            if (err) deferred.reject(err);
            deferred.resolve(dsthuoc);
        });
    
    return deferred.promise;
}

function timThuoc(thuoc) {
    
    var deferred = Q.defer();
    var reg = new RegExp(thuoc.ten_thuoc, "gi");
 
    db.thuoc.find({ten_thuoc: {$regex: reg}}, {ten_thuoc: 1}).skip(0).limit(100)
        .toArray(function (err, dsthuoc) {
            if (err) deferred.reject(err);
            
            deferred.resolve(dsthuoc);
        });
    
    return deferred.promise;
}

function chiTietThuoc(_id) {
    
    var deferred = Q.defer();
 
    db.thuoc.findOne({_id: new mongo.ObjectId(_id)}, function(err, doc) {
            if (err) deferred.reject(err);
            
            deferred.resolve(doc);
        });
    
    return deferred.promise;
}

function capNhatThuoc(_id, data) {
    var deferred = Q.defer();
 
    // validation
    db.thuoc.findById(_id, function (err, user) {
        if (err) deferred.reject(err);
 
        capNhat();
    });
 
    function capNhat() {
        // fields to update
        var set = {
            ten_thuoc: data
        };
 
        db.thuoc.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err);
 
                deferred.resolve();
            });
    }
 
    return deferred.promise;
}