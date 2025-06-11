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

CREATE TABLE tours (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description TEXT,
  location VARCHAR(100),
  duration INT,
  price INT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  tour_id INT,
  booking_date DATE,
  departure_date DATE,
  guests INT,
  total_price INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (tour_id) REFERENCES tours(id)
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT,
  payment_method ENUM('momo', 'bank', 'paypal'),
  status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  paid_at DATETIME,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

INSERT INTO users (name, email, password, phone, role)
VALUES 
('Nguyễn Văn A', 'a@gmail.com', 'hashedpassword1', '0123456789', 'user'),
('Lê Thị B', 'b@gmail.com', 'hashedpassword2', '0987654321', 'user'),
('Admin', 'phamduy2004zx@gmail.com', 'Pnkd@123', '0799097860', 'admin');

INSERT INTO tours (title, description, location, duration, price, image_url)
VALUES
('Tour Hà Giang', 'Khám phá vùng núi đá Hà Giang tuyệt đẹp', 'Hà Giang', 3, 3000000, 'https://example.com/hagiang.jpg'),
('Tour Đà Lạt', 'Trải nghiệm không khí mát mẻ ở Đà Lạt', 'Đà Lạt', 2, 2500000, 'https://example.com/dalat.jpg'),
('Tour Phú Quốc', 'Biển xanh cát trắng tại Phú Quốc', 'Phú Quốc', 4, 4000000, 'https://example.com/phuquoc.jpg');

INSERT INTO bookings (user_id, tour_id, booking_date, departure_date, guests, total_price)
VALUES
(1, 1, '2025-06-11', '2025-07-01', 2, 6000000),
(2, 2, '2025-06-12', '2025-07-05', 1, 2500000);

INSERT INTO payments (booking_id, payment_method, status, paid_at)
VALUES
(1, 'momo', 'paid', NOW()),
(2, 'bank', 'pending', NULL);
