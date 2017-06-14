
var config = require("cau-hinh-ung-dung");

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('nhatKyDieuTri');
 
var service = {};
 
service.themNhatKy = themNhatKy;
service.nhatKyDieuTri = nhatKyDieuTri;

module.exports = service;

function themNhatKy(nhatKy) {

    var deferred = Q.defer();
    db.nhatKyDieuTri.insert(nhatKy, function (err, doc) {
        if (err) deferred.reject(err);
        deferred.resolve({});
    });
    
    return deferred.promise;
}


function nhatKyDieuTri(nhatKy) {
    var deferred = Q.defer();
    db.nhatKyDieuTri.aggregate([
        {
            $match: {"chi_tiet.MaYTe": nhatKy.ma_y_te}
        },
        {
            $group : {
                _id: {MaYTe: "$chi_tiet.MaYTe", ngay_kham: "$chi_tiet.Ngay"},
                nhat_ky: {$last: "$chi_tiet"}
            }
        }
    ], function(err, dsNhatKy){
        if (err) deferred.reject(err);
        deferred.resolve({arr: dsNhatKy});
    });
    
    return deferred.promise;
}