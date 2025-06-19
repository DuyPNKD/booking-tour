USE booking_tour;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tours (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  location VARCHAR(100),
  duration VARCHAR(100),
  price INT,
  old_price INT,
  rating FLOAT,
  rating_count INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

--  Bảng Hình ảnh liên quan đến tour
CREATE TABLE IF NOT EXISTS tours_images (
   id INT PRIMARY KEY AUTO_INCREMENT,
   tour_id INT,
   image_url VARCHAR(255),
   is_featured BOOLEAN DEFAULT FALSE,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- 2. Bảng tour_overviews
CREATE TABLE IF NOT EXISTS tour_overviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tour_id INT,
  content TEXT,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- 3. Bảng tour_schedules
CREATE TABLE IF NOT EXISTS tour_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tour_id INT,
  day_text VARCHAR(100),
  title VARCHAR(255),           
  content TEXT,                             
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- 4. Bảng tour_departures
CREATE TABLE tour_departures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tour_id INT,
  departure_date DATE,
  return_date DATE,
  available_seats INT DEFAULT NULL, 
  price INT,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- 5. Bảng tour_prices
CREATE TABLE IF NOT EXISTS tour_prices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tour_id INT,
  target_type ENUM('adult', 'child', 'infant'),
  min_age INT,
  max_age INT,
  price INT,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- Bảng đánh giá tour
CREATE TABLE IF NOT EXISTS tour_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tour_id INT,
  name VARCHAR(100),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- 6. Bảng bookings
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tour_id INT,
  full_name VARCHAR(100),
  phone_number VARCHAR(20),
  email VARCHAR(100),
  departure_date DATE,
  total_price INT,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- 7. Bảng booking_details
CREATE TABLE IF NOT EXISTS booking_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT,
  target_type ENUM('adult', 'child', 'infant'),
  quantity INT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 8. Bảng payments
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT,
  amount INT,
  payment_method VARCHAR(50),
  status ENUM('unpaid', 'paid', 'failed') DEFAULT 'unpaid',
  paid_at DATETIME,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

ALTER TABLE tour_schedules
CHANGE COLUMN day_number day_text VARCHAR(100);

ALTER TABLE tour_departures
ADD COLUMN return_date DATE AFTER departure_date,
ADD COLUMN status ENUM('available', 'sold_out', 'contact') DEFAULT 'available' AFTER note,
ADD COLUMN price INT AFTER status;

ALTER TABLE tour_departures
DROP COLUMN note;

-- 1. Users
INSERT INTO users (name, email, password, phone, role)
VALUES 
('Nguyễn Văn A', 'a@gmail.com', 'hashedpassword1', '0123456789', 'user'),
('Lê Thị B', 'b@gmail.com', 'hashedpassword2', '0987654321', 'user'),
('Admin', 'phamduy2004zx@gmail.com', 'Pnkd@123', '0799097860', 'admin');

-- 2. Tours
INSERT INTO tours (title, location, duration, price, old_price, rating, rating_count)
VALUES
('Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM', 'Hà Nội', '3 ngày 2 đêm', 4056000, 3380000, 9.2, 124),
('Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM', 'Hà Nội', '3 ngày 2 đêm', 4056000, 3380000, 9.2, 124),
('Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM', 'Hà Nội', '3 ngày 2 đêm', 4056000, 3380000, 9.2, 124);

INSERT INTO tours_images (tour_id, image_url, is_featured) 
VALUES 
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Favatar%2F1713495074.jpg&w=384&q=75', TRUE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2F728c1be43b520e5cc58c9eb6da22436e.jpg&w=256&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2Ff054956de77b01f89db7b86379eb4bdb.jpg&w=256&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2Fe5cfb00c020931726024c441808fb422.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2F41ae3fe3066311c7aff5c7b4cd8970cc.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2F233e87809dc70fb875577a9cf5143b26.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2F90e955de139643e9d5ab245b46504040.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2Ffe38f2805afceaafc73e8eb5981d0cd4.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2F4bc3bb208e3a6d46283c7c77eb1827ef.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fobjectstorage.omzcloud.vn%2Fpys-object-storage%2Fweb%2Fuploads%2Fposts%2Falbums%2F4272%2Ffd0f67189416155aaeac38538256a841.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Falbums%2F4272%2F524b321f3544cf5ef7920dccbbc8a037.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Falbums%2F4272%2F50313a89dcb5dba78cae7f613d601ce2.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Falbums%2F4272%2F23fd7928353f699ba4d340f3ac882399.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Falbums%2F4272%2F0963fa8e5e0697e6fbe5954d747925ce.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Falbums%2F4272%2F16418c35b58a219babd51ea640532ee1.jpg&w=1080&q=75', FALSE),
(1, 'https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Falbums%2F4272%2Faa95876a7e6cf45573d9d3b145015642.jpg&w=1080&q=75', FALSE);

-- 3. Tour Overview
INSERT INTO tour_overviews (tour_id, content)
VALUES (1, '<p><span style="font-weight: 400;">- Đ&oacute;n b&igrave;nh minh tại đồng cừu An H&ograve;a, ngắm đ&agrave;n cừu nhởn nhơ tr&ecirc;n thảo nguy&ecirc;n hoang sơ.</span></p>
<p><span style="font-weight: 400;">- Kh&aacute;m ph&aacute; Hang R&aacute;i &ndash; vịnh Vĩnh Hy, chi&ecirc;m ngưỡng rặng san h&ocirc; tuyệt đẹp bằng t&agrave;u đ&aacute;y k&iacute;nh.</span></p>
<p><span style="font-weight: 400;">- Tham quan vườn nho Th&aacute;i An, thưởng thức nho tươi tại gi&agrave;n v&agrave; mua về l&agrave;m qu&agrave;.</span></p>
<p><span style="font-weight: 400;">- Check-in đồi c&aacute;t Nam Cương, trải nghiệm khung cảnh như sa mạc Ch&acirc;u Phi giữa l&ograve;ng Ninh Thuận.</span></p>
<p><span style="font-weight: 400;">- Kh&aacute;m ph&aacute; văn h&oacute;a Chăm, thăm th&aacute;p P&ocirc; Klong Garai v&agrave; l&agrave;ng nghề gốm, dệt truyền thống.</span></p>');


INSERT INTO tour_schedules (tour_id, day_text, title, content)
VALUES 
(1, 'Ngày 1', 'Khám phá Mũi Dinh & Biển Bình Sơn',
'<p>S&aacute;ng: Xe v&agrave; HDV&nbsp;c&ocirc;ng ty&nbsp;sẽ đ&oacute;n qu&yacute; kh&aacute;ch tại điểm hẹn khởi h&agrave;nh đi&nbsp;<strong>Ninh Thuận</strong>&nbsp;l&uacute;c 05:00. Địa chỉ:&nbsp;<strong>Nh&agrave; Văn H&oacute;a Thanh Ni&ecirc;n - số 4 Phạm Ngọc Thạch, Quận 1.</strong></p>
<p>Sau khi ăn s&aacute;ng. Đo&agrave;n tiếp tục di chuyển đi&nbsp;<strong>Ninh Thuận</strong>.</p>
<p>D&ugrave;ng bữa trưa tại&nbsp;<strong>Ninh Thuận</strong>.</p>
<p>Chiều: Xe v&agrave; HDV đưa đo&agrave;n tham quan KDL&nbsp;<strong>Tanyoli</strong>, tại&nbsp;<strong>Mũi Dinh</strong>. Qu&yacute; kh&aacute;ch tự do tham gia c&aacute;c tr&ograve; chơi (tự t&uacute;c)</p>
<p><img src="https://cdn2.ivivu.com/2020/06/23/10/ivivu-da-ngoai-tanyoli.gif" alt="KDL Tanyoli" /></p>
<p>Xe đưa qu&yacute; kh&aacute;ch về nhận ph&ograve;ng kh&aacute;ch sạn gần b&atilde;i biển&nbsp;<strong>B&igrave;nh Sơn - Ninh Chữ</strong>.</p>
<p><img src="https://cdn2.ivivu.com/2020/06/23/10/ivivu-bien-binh-son-ninh-chu.gif" alt="Biển Bình Sơn - Ninh Chữ" /></p>
<p>Tự do tắm biển &amp; kh&aacute;m ph&aacute; đặc sản về đ&ecirc;m.</p>'),
(1, 'Ngày 2', 'Đồng Cừu An Hòa - Hang Rái - Vịnh Vĩnh Hy ( Ăn Sáng, Trưa, Tối) ', '<p>Sau khi ăn s&aacute;ng, đo&agrave;n khởi h&agrave;nh tới thăm quan:</p>
<p><strong>Đồng cừu An H&ograve;a</strong>: Qu&yacute; kh&aacute;ch sẽ đ&oacute;n b&igrave;nh minh tr&ecirc;n đồng cừu, chi&ecirc;m ngưỡng cảnh đ&agrave;n cừu ra đồng rất đ&aacute;ng y&ecirc;u, ngộ nghĩnh.</p>
<p><img class="" title="" src="https://cdn2.ivivu.com/2020/06/23/10/ivivu-cuu-an-hoa4.gif" alt="" data-src="//cdn2.ivivu.com/2020/06/23/10/ivivu-cuu-an-hoa4.gif" /></p>
<p><em>Đồng Cừu An H&ograve;a.</em></p>
<p><strong>Tham quan Hang R&aacute;i</strong>&nbsp;- l&agrave; một trong những điểm nhấn khi du lịch vịnh&nbsp;<strong>Vĩnh Hy</strong>,&nbsp;<strong>Hang R&aacute;i</strong>&nbsp;mang lại cảm gi&aacute;c tuyệt hảo cho du kh&aacute;ch khi được lạc v&agrave;o xứ sở của c&acirc;u chuyện cổ t&iacute;ch bởi vẻ đẹp gần như ho&agrave;n hảo. Từ những h&ograve;n đ&aacute; nhiều h&igrave;nh th&ugrave; xếp chồng l&ecirc;n nhau tạo ra v&ocirc; số hang động lớn nhỏ đẹp mắt.</p>
<p><img class="" title="" src="https://cdn2.ivivu.com/2017/11/14/12/ivivu-hang-rai.jpg" alt="" data-src="//cdn2.ivivu.com/2017/11/14/12/ivivu-hang-rai.jpg" /></p>
<p><em>Hang R&aacute;i.</em></p>
<p>Tới l&agrave;ng ch&agrave;i&nbsp;<strong>Vĩnh Hy</strong>, t&agrave;u đ&aacute;y k&iacute;nh sẽ đưa qu&yacute; kh&aacute;ch tới thăm những rặng san h&ocirc; nhiều m&agrave;u sắc, những lo&agrave;i c&aacute; biển v&ocirc; số sắc m&agrave;u xanh &oacute;ng &aacute;nh hoặc đỏ, v&agrave;ng&hellip;.Tại vịnh&nbsp;<strong>Vĩnh Hy</strong>, qu&yacute; kh&aacute;ch c&oacute; thể lựa chọn chương tr&igrave;nh lặn biển ngắm san h&ocirc; cũng rất hấp dẫn.</p>
<p><img class="" title="" src="https://cdn2.ivivu.com/2020/06/23/10/ivivu-lang-chai-vinh-hy.gif" alt="" data-src="//cdn2.ivivu.com/2020/06/23/10/ivivu-lang-chai-vinh-hy.gif" /></p>
<p><em>Vịnh Vĩnh Hy.</em></p>
<p>Ăn trưa hải sản tại nh&agrave; b&egrave;. C&ugrave;ng thưởng thức những m&oacute;n hải sản tươi ngon nhất.</p>
<p>Quay về th&agrave;nh phố, tr&ecirc;n đường gh&eacute; thăm:</p>
<p><strong>Vườn nho Th&aacute;i An</strong>: Qu&yacute; kh&aacute;ch sẽ th&iacute;ch th&uacute; khi được tận mắt chứng kiến những gi&agrave;n nho trĩu quả, rợp m&aacute;t, tự do chụp ảnh, thưởng thức nho ngay tại gi&agrave;n. Qu&yacute; kh&aacute;ch c&oacute; thể mua nho tươi về l&agrave;m qu&agrave;.</p>
<p><img class="" title="" src="https://cdn2.ivivu.com/2020/06/23/10/ivivu-vuon-nho-thai-an.gif" alt="" data-src="//cdn2.ivivu.com/2020/06/23/10/ivivu-vuon-nho-thai-an.gif" /></p>
<p><em>Vườn Nho Th&aacute;i An.</em></p>
<p><strong>Thăm đồi c&aacute;t Nam Cương</strong>&nbsp;- l&agrave; một trong những đồi c&aacute;t đẹp nhất, hoang sơ nhất tại&nbsp;<strong>Ninh Thuận</strong>. Đến đ&acirc;y qu&yacute; kh&aacute;ch chắc chắn sẽ c&oacute; những bức ảnh tuyệt đẹp, mang lại cảm gi&aacute;c kh&ocirc;ng kh&aacute;c g&igrave; qu&yacute; kh&aacute;ch đang đi du lịch tại những sa mạc ở Ch&acirc;u Phi&hellip;</p>
<p><img class="" title="" src="https://cdn2.ivivu.com/2020/06/23/10/ivivu-sa-mac-mui-dinh.gif" alt="" data-src="//cdn2.ivivu.com/2020/06/23/10/ivivu-sa-mac-mui-dinh.gif" /></p>
<p><em>Đồi C&aacute;t Nam Cương.</em></p>
<p>Ăn tối tại nh&agrave; h&agrave;ng với thịt cừu, đặc sản của v&ugrave;ng đất&nbsp;<strong>Phan Rang</strong>. Đo&agrave;n quay về kh&aacute;ch sạn ở&nbsp;<strong>TP Phan Rang</strong>.</p>'),
(1, 'Ngày 3', 'Khám Phá Ninh Thuận (Ăn Sáng, Trưa )', '<p>Sau bữa s&aacute;ng. Xe v&agrave; HDV đưa đo&agrave;n thăm:</p>
<p><strong>Th&aacute;p P&ocirc; Kl&ocirc;ng Garai</strong>, biểu tượng văn h&oacute;a của đồng b&agrave;o Chăm, nghe những truyền thuyết xung quanh vị thần t&agrave;i ba n&agrave;y. Quần thể th&aacute;p nằm trọn vẹn tr&ecirc;n ngọn đồi Trầu, cụm th&aacute;p được x&acirc;y dựng từ thế kỷ XII để thờ vị thần P&ocirc; Kl&ocirc;ng Garai, tương tryền người c&oacute; c&ocirc;ng ph&aacute;t triển hệ thống thủy lợi ở xứ Panduranga xưa kia.&nbsp;</p>
<p><img class="" title="" src="https://cdn2.ivivu.com/2020/06/23/10/ivivu-thap-poklonggarai.gif" alt="" data-src="//cdn2.ivivu.com/2020/06/23/10/ivivu-thap-poklonggarai.gif" /></p>
<p><em>Th&aacute;p P&ocirc; Kl&ocirc;ng Garai.</em></p>
<p>Thăm hai l&agrave;ng nghề nổi tiếng của người&nbsp;<strong>Chăm&nbsp;</strong>l&agrave;<strong>&nbsp;L&agrave;ng gốm B&agrave;u Tr&uacute;c</strong>&nbsp;v&agrave; l&agrave;ng dệt&nbsp;<strong>Mỹ Nghiệp</strong>. Đến đ&acirc;y qu&yacute; kh&aacute;ch sẽ được chứng kiến tận mắt c&aacute;c nghệ nh&acirc;n dệt những tấm thổ cẩm hết sức c&ocirc;ng phu v&agrave; kh&eacute;o l&eacute;o cũng như tạo ra những sản phẩm gốm bằng phương ph&aacute;p thủ c&ocirc;ng hết sức mộc mạc.</p>
<p><img class="" title="" src="https://cdn2.ivivu.com/2020/06/23/10/ivivu-lang-gom-bau-truc-1.gif" alt="" data-src="//cdn2.ivivu.com/2020/06/23/10/ivivu-lang-gom-bau-truc-1.gif" /></p>
<p><em>L&agrave;ng Gốm Bầu Tr&uacute;c.</em></p>
<p>Ăn trưa tại nh&agrave; h&agrave;ng với đặc sản địa phương Đo&agrave;n khởi h&agrave;nh về&nbsp;<strong>S&agrave;i G&ograve;n</strong>.</p>
<p>Đo&agrave;n về đến TP. HCM, kết th&uacute;c chương tr&igrave;nh tham quan cực kỳ đặc sắc. HDV&nbsp;c&ocirc;ng ty&nbsp;chia tay v&agrave; hẹn gặp lại qu&yacute; kh&aacute;ch tr&ecirc;n những h&agrave;nh tr&igrave;nh th&uacute; vị kh&aacute;c của c&ocirc;ng ty.</p>');
;

-- 5. Tour Departures
INSERT INTO tour_departures (tour_id, departure_date, return_date, available_seats, price)
VALUES
(1, '2025-07-04', '2025-07-09', 11, 18990000),
(1, '2025-07-11', '2025-07-16', NULL, 18990000),
(1, '2025-07-18', '2025-07-23', 20, 18990000),
(1, '2025-07-25', '2025-07-30', 24, 18990000),
(1, '2025-08-01', '2025-08-06', NULL, 18990000),
(1, '2025-08-15', '2025-08-20', 29, 18990000),
(1, '2025-08-30', '2025-09-03', 29, 18990000),
(1, '2025-09-19', '2025-09-24', 29, 16990000),
(1, '2025-09-26', '2025-10-01', 29, 16990000);


-- 6. Tour Prices
INSERT INTO tour_prices (tour_id, target_type, min_age, max_age, price)
VALUES
(1, 'adult', 10, 99, 3000000),
(1, 'child', 5, 9, 2000000),
(1, 'infant', 0, 4, 0);

-- Bảng đánh giá tour
INSERT INTO tour_reviews (tour_id, name, rating, comment)
VALUES
  (1, 'Nguyễn Văn A', 5, 'Chuyến đi rất tuyệt vời, hướng dẫn viên thân thiện!'),
  (1, 'Trần Thị B', 4, 'Khách sạn ổn, đồ ăn ngon, chỉ hơi nắng một chút.');

-- 7. Bookings
INSERT INTO bookings (tour_id, full_name, phone_number, email, departure_date, total_price, status)
VALUES
(1, 'Nguyễn Văn A', '0123456789', 'a@gmail.com', '2025-07-01', 8000000, 'confirmed'),
(2, 'Lê Thị B', '0987654321', 'b@gmail.com', '2025-07-05', 2500000, 'pending');

-- 8. Booking details
INSERT INTO booking_details (booking_id, target_type, quantity)
VALUES
(1, 'adult', 2),
(1, 'child', 1),
(2, 'adult', 1);

-- 9. Payments
INSERT INTO payments (booking_id, amount, payment_method, status, paid_at)
VALUES
(1, 8000000, 'momo', 'paid', NOW()),
(2, 2500000, 'bank_transfer', 'unpaid', NULL);

ALTER TABLE tour_schedules ADD COLUMN title VARCHAR(255);
ALTER TABLE tour_schedules DROP COLUMN image_url;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS users;