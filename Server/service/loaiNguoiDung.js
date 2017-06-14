
var config = require("cau-hinh-ung-dung");

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('loaiNguoiDung');
 
var service = {};
 
service.dsLoaiNguoiDung = dsLoaiNguoiDung;
service.loaiNguoiDung = loaiNguoiDung;
service.dsLoaiCongViec = dsLoaiCongViec;
service.taoMoi = taoMoi;

module.exports = service;
function dsLoaiNguoiDung() {
    var deferred = Q.defer();
 
    db.loaiNguoiDung.find()
    .toArray(function (err, dsLoai) {
        if (err) deferred.reject(err);
        arr = {};
        for(var i = 0; i < dsLoai.length; i++) {
            value = dsLoai[i].value;
            key = dsLoai[i].key;
            arr[key] = value;
        }
        deferred.resolve(arr);
    });
 
    return deferred.promise;
}
function dsLoaiCongViec(dieuKien) {
    var deferred = Q.defer();
 
    db.loaiNguoiDung.find(dieuKien, {lich: 1})
    .toArray(function (err, danhSachLich) {
        if (err) deferred.reject(err);

        deferred.resolve(danhSachLich);
    });
 
    return deferred.promise;
}
function loaiNguoiDung(dieuKien) {
    var deferred = Q.defer();
 
    db.loaiNguoiDung.findOne(dieuKien, {lich: 1, lichkham: 1}, function (err, loai) {
        if (err) deferred.reject(err);
        console.log(loai);
        deferred.resolve(loai);
    });
 
    return deferred.promise;
}
function taoMoi(loaiNguoiDung) {
    var deferred = Q.defer();
    
    loaiNguoiDung.cre_ts = new Date();
    db.loaiNguoiDung.insert(
        loaiNguoiDung,
        function (err, doc) {
            if (err) deferred.reject(err);
            
            deferred.resolve(loaiNguoiDung.cre_ts);
        });

    return deferred.promise;
}