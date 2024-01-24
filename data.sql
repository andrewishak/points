
CREATE DATABASE points DEFAULT CHARACTER SET = 'utf8mb4';

Use points;
-- Create 'names' table
CREATE TABLE names (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
);
INSERT INTO names (name)
VALUES ('ابانوب شحات'),
    ('اندرو اسحق'),
    ('انيس شنودة'),
    ('بيشوى برطام'),
    ('جرجس ويليم'),
    ('عصام عدلى'),
    ('كيرلس اسحق'),
    ('كيرلس ناجى'),
    ('ماركو عياد'),
    ('ماريان فايز'),
    ('ماريو فوزى'),
    ('مايكل صفوت'),
    ('مايكل متى '),
    ('مايكل مجدى'),
    ('محسن ظريف'),
    ('مينا عاطف'),
    ('نرمين ابراهيم'),
    ('نشاءت صبحى'),
    ('وجيه وديع'),
    ('يوستينا شمشون');
-- Create 'groups' table

CREATE TABLE rht (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
);

INSERT INTO rht (name)
VALUES ('الرهط الاول'),
    ('الرهط الثانى'),
    ('الرهط الثالث'),
    ('الرهط الرابع');
-- Create 'group_points' table
CREATE TABLE group_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT,
    points INT,
    name_id INT,
    notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    FOREIGN KEY (group_id) REFERENCES rht(id),
    FOREIGN KEY (name_id) REFERENCES names(id)
);

INSERT INTO group_points (group_id, points, name_id, notes) 
VALUES (1, 100, 2, 'Initial points');

INSERT INTO group_points (group_id, points, name_id, notes) 
VALUES (2, 100, 2, 'Initial points');

INSERT INTO group_points (group_id, points, name_id, notes) 
VALUES (3, 100, 2, 'Initial points');

INSERT INTO group_points (group_id, points, name_id, notes) 
VALUES (4, 100, 2, 'Initial points');

