CREATE DATABASE IF NOT EXISTS uncrowned_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uncrowned_db;

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(80)  NOT NULL,
  email      VARCHAR(191) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  age        TINYINT UNSIGNED NOT NULL,
  role       ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token      VARCHAR(100) PRIMARY KEY,
  user_id    INT,
  username   VARCHAR(80),
  role       VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(191) NOT NULL,
  category   VARCHAR(60)  NOT NULL,
  price      INT UNSIGNED NOT NULL,
  sizes      JSON,
  image      TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  order_num        VARCHAR(20)  NOT NULL UNIQUE,
  user_id          INT          NOT NULL,
  subtotal         INT UNSIGNED NOT NULL,
  shipping         INT UNSIGNED NOT NULL DEFAULT 150,
  total            INT UNSIGNED NOT NULL,
  payment_method   VARCHAR(20)  NOT NULL,
  status           ENUM('pending','out_for_delivery','completed','cancelled') NOT NULL DEFAULT 'pending',
  address          JSON,
  rated            TINYINT(1)   NOT NULL DEFAULT 0,
  rating           TINYINT UNSIGNED,
  rating_comment   TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT          NOT NULL,
  product_id INT,
  name       VARCHAR(191) NOT NULL,
  category   VARCHAR(60),
  size       VARCHAR(10),
  price      INT UNSIGNED NOT NULL,
  image      TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT IGNORE INTO products (name, category, price, sizes, image) VALUES
('Heavyweight Box Tee',   'shirts',  1200, '["S","M","L","XL","2XL"]', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80'),
('Tactical Cargo Pants',  'pants',   2800, '["S","M","L","XL","2XL"]', 'https://images.unsplash.com/photo-1517445312582-5e48d29b23b3?auto=format&fit=crop&w=600&q=80'),
('Varsity Bomber Jacket', 'jackets', 4500, '["S","M","L","XL"]',       'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80'),
('Nylon Utility Shorts',  'shorts',  1500, '["S","M","L","XL","2XL"]', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80'),
('Oversized Hoodie',      'jackets', 3200, '["M","L","XL","2XL"]',     'https://images.unsplash.com/photo-1556906781-9a412961d289?auto=format&fit=crop&w=600&q=80'),
('Graphic Street Tee',    'shirts',  1100, '["S","M","L","XL","2XL"]', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=600&q=80');
