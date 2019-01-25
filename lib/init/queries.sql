
CREATE TABLE section(
   id INT(10) AUTO_INCREMENT,
   name VARCHAR(100),
   PRIMARY KEY(id),
) ENGINE=INNODB;


CREATE TABLE screen(
   id INT(10) AUTO_INCREMENT,
   name VARCHAR(100),
   sectionid INT(10),
   PRIMARY KEY(id),
	FOREIGN KEY (sectionid)
      REFERENCES section(id)
      ON UPDATE CASCADE ON DELETE RESTRICT

)ENGINE=INNODB;

ALTER TABLE user
ADD name VARCHAR(100),
ADD contact_num VARCHAR(20),
ADD created_at TIMESTAMP,
ADD created_by INT(10)



CREATE TABLE role_screen_permission(
   id INT(20) AUTO_INCREMENT,
   role_id INT(11),
   screen_id INT(10),
   permission INT(1),
   PRIMARY KEY(id)
)ENGINE=INNODB;
FOREIGN KEY (role_id) REFERENCES user_role(role_id) ON UPDATE CASCADE ON DELETE RESTRICT
FOREIGN KEY (screen_id)  REFERENCES screen.id  ON UPDATE CASCADE ON DELETE RESTRICT



ALTER TABLE internal_order ADD column upload_list_tracking_id varchar(100)

ALTER TABLE fabric_inventory ADD column width int(10)

ALTER table user_role (role_id INT NOT NULL AUTO_INCREMENT);

ALTER TABLE user_role MODIFY COLUMN role_id INT AUTO_INCREMENT;

INSERT INTO section (name) VALUES ("Fourth Section")

INSERT INTO screen (name , sectionId) VALUES ("FIRST SCREEN" , 1)

INSERT INTO screen (name , sectionId) VALUES ("FOURTH SCREEN" , 2)


CREATE TABLE pattern_marker(
   id INT(20) AUTO_INCREMENT,
   pattern_num VARCHAR(20),
	fab_id varchar(100),
   width INT(10),
   image_url VARCHAR(255),
     PRIMARY KEY(id)
)ENGINE=INNODB;

