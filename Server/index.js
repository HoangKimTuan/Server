// những thiết lập cơ bản của server
var config = require("cau-hinh-ung-dung");

// nhưng sự kiện do ta định nghĩa, khai báo ra file để đảm bảo thống nhất cả server và client
var suKien = require("su-kien");

// thiết lập 1 server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// mở request tới service của bệnh viện
var http = require("./hamChucNang/http");

// dùng dể chuyển ngày tháng sáng chuỗi theo 1 format quy định
var dateFormat = require('dateformat');

// Dịch vụ do mình định nghĩa
var nguoiDung = require('./service/nguoiDung');
var cuocTroChuyen = require('./service/cuocTroChuyen');
var loaiNguoiDung = require('./service/loaiNguoiDung');
var lichBacSi = require('./service/lichBacSi');
var thuoc = require('./service/thuoc');
var nhatKyDieuTri = require('./service/nhatKyDieuTri');
var tamSoatBenh = require('./service/tamSoatBenh');
// thuoc.danhSachThuoc()
//     .then(function(data){
//         data.forEach(function(element) {
//             thuoc.capNhatThuoc(element._id.toString(), element.ten_thuoc.trim());
//         }, this);
//     })
//     .catch(function(err){
//         console.log(err);
//     });

// Khởi chạy server trên port được quy định trong config
server.listen(config.serverPort);
console.log("Starting server on: " + config.serverPort);

// chưa thông tin socket của người dùng, mục đích để thống kê người dùng
var dsBenhNhan = [];
var dsBacSi = [];

// các phòng: mục tiêu chia nhỏ các loại socket ra để quản lý
var phong = {
    benhNhan: "benh nhan",
    bacSi: "bac si",
    tuDo: "tu do"
}

var dsLoaiNguoiDung = {};

loaiNguoiDung.dsLoaiNguoiDung()
    .then(function(obj) {
        dsLoaiNguoiDung = obj
    }).catch(function(err){
        console.log(err);
    });

// 2 namespace tương ứng cho bác sĩ và bệnh nhân để quản lý sự kiện
var nspBn = io.of("benh-nhan");
var nspBs = io.of("bac-si");



function thietLapChungSocket(socket) {
    // Thiết lập phòng của socket
    socket.room = phong.tuDo;
    // Đưa socket vào phòng tự do
    socket.join(phong.tuDo);


    // sự kiện mất kết nối với người dùng, , tên sự kiện này là mặc định
    socket.on("disconnect", function() {
        console.log("Nguoi dung roi khoi ung dung");
        // loại người dùng khỏi phòng, tên phòng đã được lưu trong hàm login
        socket.leave(socket.phong);
        // xóa khỏi danh bạ
        if (socket.phong == phong.bacSi) {
            dsBacSi.splice(dsBacSi.indexOf(socket), 1);
            console.log("so bac si ket noi hien tai: " + dsBacSi.length + "");
        } else if (socket.phong == phong.benhNhan) {
            dsBenhNhan.splice(dsBenhNhan.indexOf(socket), 1);
            console.log("so benh nhan ket noi hien tai: " + dsBenhNhan.length + "");
        }
    });


    // sự kiện đăng ký
    socket.on(suKien.dangKy, function(userData, fn){
        userData.type = socket.loaiUngDung;
        nguoiDung.taoNguoiDung(userData)
            .then(function () {
                console.log("Dang ky thanh cong");
                fn({status: "1", message: "Đăng ký thành công!!!"});
            })
            .catch(function (err) {
                fn({status: "-1", message: "Số điện thoại này đã được đăng ký"});
                console.log(err);
            });
    });

    // Sự kiện đăng nhập
    socket.on(suKien.dangNhap, function(userData, fn){
        nguoiDung.chungThuc(userData.username, userData.password, socket.loaiUngDung)
            .then(function (data) {
                
                console.log("Dang nhap thanh cong");
                
                socket.user_id = data._id;
                socket.loaiNguoiDung = data.type;

                if (socket.loaiNguoiDung == dsLoaiNguoiDung.bacSi) {
                    socket.phong = phong.bacSi;
                    // Đưa socket này vào trong danh sách bác sĩ kết nối. giống như danh bạ
                    dsBacSi.push(socket);
                } else if (socket.loaiNguoiDung == dsLoaiNguoiDung.benhNhan) {
                    socket.phong = phong.benhNhan;
                    // Đưa socket này vào trong danh sách bệnh nhân kết nối
                    dsBacSi.push(socket);
                }
                
                socket.join(socket.phong);
                fn({status: 1, message: "Xin chào"});
            })
            .catch(function (err) {
                fn({status: -1, message: "Error"});
            });
    });

    // Tìm thuốc trong danh sách
    socket.on(suKien.timThuoc, function(userData, callback){
        if (socket.phong !== undefined) {
            thuoc.timThuoc(userData)
                .then(function(data){
                    callback({arr: data})
                })
                .catch(function(err){
                    console.log(err);
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // Lấy danh sách thuốc
    socket.on(suKien.layDSThuoc, function(userData, callback){
        if (socket.phong !== undefined) {
            thuoc.danhSachThuoc()
                .then(function(data){
                    callback({arr: data})
                })
                .catch(function(err){
                    console.log(err);
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // Lấy thông tin chi tiết thuốc
    socket.on(suKien.layTTChiTietThuoc, function(userData, callback){
        if (socket.phong !== undefined) {
            thuoc.chiTietThuoc(userData._id)
                .then(function(data){
                    callback(data)
                })
                .catch(function(err){
                    console.log(err);
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // Tra cứu tầm soát bệnh (các bệnh có thể gặp theo độ tuổi)
    socket.on(suKien.traCuuTamSoatBenh, function(userDate, callback) {
        if (socket.phong !== undefined) {
            tamSoatBenh.thongTin(userDate)
                .then(function(dsBenh){
                    callback(dsBenh)
                })
                .catch(function(err){
                    console.log(err);
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });


    // Lấy nội dung chi tiết tin nhắn trò chuyện của bác sĩ với bệnh nhân
    socket.on(suKien.layNoiDungTroChuyen, function(userData, callback){
        if (socket.phong !== undefined) {
            idTroChuyen = "";
            if(socket.phong == phong.benhNhan) {
                idTroChuyen = cuocTroChuyen.idTroChuyen(socket.user_id, userData.to);
            } else {
                idTroChuyen = cuocTroChuyen.idTroChuyen(userData.to, socket.user_id);
            }
            cuocTroChuyen.chiTietTroChuyen({
                conv_id: new RegExp(idTroChuyen)
            })
                .then(function(arr) {
                    callback({arr: arr});
                })
                .catch(function (err) {
                    console.log(err);
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // Gửi tin nhắn tới 1 cuộc trò chuyện
    socket.on(suKien.guiTinNhan, function(userData, callback){
        if (socket.phong !== undefined) {
            idTroChuyen = "";
            if(socket.phong == phong.benhNhan) {
                idTroChuyen = cuocTroChuyen.idTroChuyen(socket.user_id, userData.to);
            } else {
                idTroChuyen = cuocTroChuyen.idTroChuyen(userData.to, socket.user_id);
            }
            conversation = {
                conv_id: idTroChuyen,
                from: socket.user_id,
                to: userData.to,
                message: userData.msg,
                read: {
                    benhNhan: false,
                    bacSi: true
                }
            };


            cuocTroChuyen.taoTroChuyen(conversation)
                .then(function(time) {
                    dsBenhNhan.find(function(element){
                        if (element.user_id == conversation.to) {
                            element.emit(suKien.tinNhanMoi, {
                                from: socket.user_id,
                                msg: userData.msg,
                                time: time
                            });
                            console.log("gui tin nhan")
                            return;
                        }
                    });
                    callback();
                })
                .catch(function(err){
                    console.log(err);
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });
}





// Sự kiến có bác sĩ kết nối, tên sự kiện này là mặc định
nspBs.on("connection", function(socket){
    console.log("co bac si truy cap");

    // loại ứng dụng để xác định ứng dụng của bác sĩ hay của bệnh nhân
    socket.loaiUngDung = dsLoaiNguoiDung.bacSi;
    thietLapChungSocket(socket);

    // hiện tại 1 số biến trong database vẫn chưa đổi sang tiếng việt được nên chung ta xử lý sau nha



    // bắt đầu các sự kiện dưới đây, mọi sự kiện đều cần kiểm tra socket có quyền không bằng cách kiểm tra phòng của socket đó
    // lấy danh sách bệnh nhân
    socket.on(suKien.layDSBenhNhan, function(userData, callback) {
        if (socket.phong == phong.bacSi) {
            var today = new Date();
            var priorDate = new Date().setDate(today.getDate() - 10);

            http.guiRequest(config.serviceIP, config.servicePort, "/api/BV_BenhNhan/GetDsBenhNhanNoiTru", "GET", {
                TuNgay: dateFormat(priorDate, "yyyy/mm/dd"),
                DenNgay: dateFormat(today, "yyyy/mm/dd")
            }, function(data){
                try{ 
                    arr = JSON.parse(data);
                    // console.log(arr);
                    callback({arr: arr});
                } catch(ex) {
                    console.log("Service trả về dữ liệu không hợp lệ: " + ex);
                }
            });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // lấy thông tin về lịch trực và lịch họp của bệnh viện
    socket.on(suKien.layLichBenhVien, function(userData, callback) {
        if (socket.phong == phong.bacSi) {
            var today = new Date();
            var priorDate = new Date().setDate(today.getDate() - 10);
            path = "";
            if (userData.data == 1){
                path = "/api/HT_Files/GetLichTruc";
            } else {
                path = "/api/HT_Files/GetLichHop"
            }
            http.guiRequest(config.serviceIP, config.servicePort, path, "GET", {}, function(data){
                try{ 
                    arr = JSON.parse(data);
                    // console.log(arr);
                    callback({arr: arr});
                } catch(ex) {
                    console.log("Service trả về dữ liệu không hợp lệ: " + ex);
                }
            });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // lấy thông tin bệnh nhân nội trú tại bệnh viện
    socket.on(suKien.layTTBenhNhan, function (userData, callback) {
        console.log(userData);
        if (socket.phong == phong.bacSi) {
            http.guiRequest(config.serviceIP, config.servicePort, "/api/BV_BenhAn/GetAll", "GET", userData, function(data){
                try{ 
                    arr = JSON.parse(data);
                    // console.log(arr);
                    callback({arr: arr});
                } catch(ex) {
                    console.log("Service trả về dữ liệu không hợp lệ: " + ex);
                }
            });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });
    
    // Lấy danh sách tin nhắn trò chuyện của bác sĩ với bệnh nhân
    socket.on(suKien.layDSTinNhan, function (userData, callback){
        if (socket.phong == phong.bacSi) {
            cuocTroChuyen.dsTroChuyen(socket.user_id)
                .then(function(arr) {
                    callback({arr: arr});
                })
                .catch(function (err) {
                    console.log(err);
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // Lấy về danh mục công việc theo loại mà bác sĩ có thể gặp phải như họp, học, khám, mổ....
    socket.on(suKien.layDSLoaiCongViec, function(userData, callback) {
        if (socket.phong == phong.bacSi) {
            loaiNguoiDung.dsLoaiCongViec({value: socket.loaiNguoiDung})
                .then(function(dsLoaiCongViec){
                    callback(dsLoaiCongViec);
                })
                .catch(function(err){

                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // Bác sĩ thêm 1 múi thời gian nào đó cho công việc tại bệnh viện
    socket.on(suKien.taoLichLamViec, function(userData, callback) {
        if (socket.phong == phong.bacSi) {
            userData.user_id = socket.user_id;

            lichBacSi.taoLich(userData)
                .then(function(data){
                    callback({stast: 1, msg: "Đã lưu lịch"});
                })
                .catch(function(err){
                    callback({stast: -1, msg: err.msg});
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // Những công việc còn lại bác sĩ chưa hoàn tất
    socket.on(suKien.layDSLichLamViec, function(userData, callback) {
        if (socket.phong == phong.bacSi) {
            userData.user_id = socket.user_id;
            
            lichBacSi.dsLichBacSi(userData)
                .then(function(dsLichBacSi){
                    loaiNguoiDung.loaiNguoiDung({value: socket.loaiNguoiDung})
                        .then(function (loaiNguoiDung){
                            // console.log(loaiNguoiDung);
                            for (i = 0; i < dsLichBacSi.length; i++) {
                                dsLichBacSi[i].job_name = "";
                                for (j = 0; j < loaiNguoiDung.lich.length; j++) {
                                    if (dsLichBacSi[i].job == loaiNguoiDung.lich[j].key) {
                                        dsLichBacSi[i].job_name = loaiNguoiDung.lich[j].name;
                                        break;
                                    }
                                }
                                dsLichBacSi[i].lichkham = loaiNguoiDung.lichkham;
                            }
                            callback({arr: dsLichBacSi});
                        })
                        .catch(function(typeErr){
                            console.log(typeErr);
                        });
                })
                .catch(function(err){
                    console.log(err);
                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });

    // Lấy nhật ký điều trị của bệnh nhân dựa vào mã y tế
    // Hàm này có 1 đặc điểm là nó sẽ lưu lại thông tin cuối cùng cập nhật, nếu đã cũ nó sẽ gửi request đi lấy dữ liệu mới
    socket.on(suKien.layNhatKyDieuTri, function(userData, callback) {
        if (socket.phong == phong.bacSi) {
            hom_nay = dateFormat(new Date(), "yyyy/mm/dd");
            
            nhatKyDieuTri.nhatKyDieuTri(userData)
                .then(function(data){
                    bat_dau = dateFormat(new Date(2017, 0, 1), "yyyy/mm/dd");;

                    var arr = data.arr;

                    if (arr.length > 0)
                        bat_dau = dateFormat(arr[0].ngay_cap_nhat, "yyyy/mm/dd");

                    if (bat_dau == hom_nay) {
                        callback({arr: arr});
                    } else {
                        http.guiRequest(config.serviceIP, config.servicePort, "/api/BV_BenhNhan/GetLichSuBenhNhan", "GET", {
                            TuNgay: bat_dau,
                            DenNgay: hom_nay,
                            MaYTe: userData.ma_y_te
                        }, function(res){
                            try{ 
                                obj = JSON.parse(res);
                                console.log(obj.DsNgoaiTru.length);
                                obj.DsNgoaiTru.forEach(function(element) {
                                    nhatKy = {
                                        loai_dieu_tri: "NgT",
                                        ngay_cap_nhat: new Date(),
                                        chi_tiet: element
                                    };
                                    arr.push(nhatKy);
                                    nhatKyDieuTri.themNhatKy(nhatKy);
                                }, this);
                                obj.DsNoiTru.forEach(function(element) {
                                    nhatKy = {
                                        loai_dieu_tri: "NT",
                                        ngay_cap_nhat: new Date(),
                                        chi_tiet: element
                                    };
                                    arr.push(nhatKy);
                                    nhatKyDieuTri.themNhatKy(nhatKy);
                                }, this);

                                callback({arr: arr});
                            } catch(ex) {
                                console.log("Service trả về dữ liệu không hợp lệ: " + ex);
                            }
                        });
                    }
                })
                .catch (function(err){

                });
        } else {
            console.log("Bạn không có quyền truy cập thông tin này");
        }
    });
});



// Sự kiện có bệnh nhân truy cập
nspBn.on("connection", function(socket){
    console.log("co benh nhan truy cap");
    socket.loaiUngDung = dsLoaiNguoiDung.benhNhan;

    thietLapChungSocket(socket);



    socket.on(suKien.layDSTinNhan, function(userData, callback) {
        nguoiDung.dsNguoiDung({type: dsLoaiNguoiDung.bacSi})
            .then(function(users) {
                callback({arr: users});
            })
            .catch(function(err) {
                console.log(err);
            });
    });
});