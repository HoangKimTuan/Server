
var config = require("cau-hinh-ung-dung");

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('lichBacSi');

var service = {};
 
service.dsLichBacSi = dsLichBacSi;
service.lichBacSi = lichBacSi;
service.taoLich = taoLich;

module.exports = service;
function dsLichBacSi(dieuKien) {
    var deferred = Q.defer();
    now = new Date();
    
    db.lichBacSi.find({
        user_id: dieuKien.user_id,
        end: {$gt: now.getTime()}
    })
    .toArray(function (err, dsLichBacSi) {
        if (err) deferred.reject(err);
        
        deferred.resolve(dsLichBacSi);
    });
 
    return deferred.promise;
}
function lichBacSi(dieuKien) {
    var deferred = Q.defer();
 
    db.lichBacSi.findOne({
        user_id: dieuKien.user_id,
    }, function (err, lichBacSi) {
        if (err) deferred.reject(err);
        deferred.resolve(lichBacSi);
    });
 
    return deferred.promise;
}

function taoLich(lich) {
    var deferred = Q.defer();
    
    db.lichBacSi.find({user_id: lich.user_id}).toArray(function (err, lichBacSi) {
        if (err) deferred.reject(err);

        else {
            var error = false;
            lichBacSi.forEach(function(element) {
                if (kiemTraTrungLich(element, calendar)) {
                    error = true;
                    return deferred.reject({msg: "Trùng thời gian với sụ kiện đã có"});
                }
            }, this);
            if (!error) {
                // console.log("insert");
                taoMoiLich();
            }
        }

        deferred.resolve(calendar);
    });
        
    function kiemTraTrungLich(a, b) {
        if (b.start >= a.end)
            return false;

        if (b.end <= a.start)
            return false;

        return true;
    }
    
    function taoMoiLich() {
        lich.cre_ts = new Date();
        db.lichBacSi.insert(
            lich,
            function (err, doc) {
                if (err) deferred.reject(err);
                
                deferred.resolve(lich.cre_ts);
            });
    }

    return deferred.promise;
}