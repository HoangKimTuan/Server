
var config = require("cau-hinh-ung-dung");

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('cuocTroChuyen');
 
var service = {};
 
service.dsTroChuyen = dsTroChuyen;
service.chiTietTroChuyen = chiTietTroChuyen;
service.taoTroChuyen = taoTroChuyen;
service.idTroChuyen = idTroChuyen;

module.exports = service;
function chiTietTroChuyen(dieuKien, from = 0, limit = 30) {
    var deferred = Q.defer();
    
    console.log(dieuKien);

    db.cuocTroChuyen.find(dieuKien)
    .limit(limit)
    .skip(from)
    .sort({ cre_ts: -1 })
    .toArray(function (err, dsTroChuyen) {
        if (err) deferred.reject(err);
        
        deferred.resolve(dsTroChuyen);
    });
 
    return deferred.promise;
}

function dsTroChuyen(userId) {
    var deferred = Q.defer();
    
    db.cuocTroChuyen.aggregate([
        {
            $match: {to: "" + userId}
        },
        { 
            $group : { 
                _id : {from: "$from", to: "$to"},
                read: {$last: "$read.bacSi"}, 
                conv_id: {$first: "$conv_id"}, 
                cre_ts: {$last: "$cre_ts"}
            }, 
        },
        {
            $lookup: {
                from: "nguoiDung",
                localField: "_id.from",
                foreignField: "_id",
                as: "nguoiDung"
            }
        },
        { 
            $sort : { cre_ts : -1} 
        }
    ], function (err, dsTinNhan) {
        if (err) deferred.reject(err);
        arr = [];
        dsTinNhan.forEach(function(element) {
            // console.log(element.nguoiDung[0].ma_y_te);
            arr.push({
                name: element.nguoiDung[0].name, 
                read: (element.read ? "true" : "false"),
                from: element._id.from,
                conv_id: element.conv_id,
                ma_y_te: element.nguoiDung[0].ma_y_te
            });
        }, this);
        
        deferred.resolve(arr);
    });

    return deferred.promise;
}

function taoTroChuyen(thongTin) {
    var deferred = Q.defer();
    
    thongTin.cre_ts = new Date();
    db.cuocTroChuyen.insert(
        thongTin,
        function (err, doc) {
            if (err) deferred.reject(err);
            
            deferred.resolve(thongTin.cre_ts);
        });

    return deferred.promise;
}

function idTroChuyen(idBasSi, idBenhNhan) {
    return idBasSi + "_" + idBenhNhan;
}