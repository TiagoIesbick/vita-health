-- MySQL Database - vita_health Script

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema hack_saude
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `vita_health` ;

-- -----------------------------------------------------
-- Schema hack_saude
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `vita_health` DEFAULT CHARACTER SET utf8mb4 ;
USE `vita_health` ;

-- -----------------------------------------------------
-- Table `vita_health`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vita_health`.`Users` (
  `userId` INT NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(255) NOT NULL,
  `lastName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `userType` ENUM('Patient', 'Doctor') NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `acceptTerms` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`userId`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vita_health`.`Patients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vita_health`.`Patients` (
  `patientId` INT NOT NULL AUTO_INCREMENT,
  `dateOfBirth` DATE NULL,
  `gender` ENUM('male', 'female', 'other') NULL,
  `userId` INT NOT NULL,
  PRIMARY KEY (`patientId`),
  INDEX `patientsUserId_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `patientsUserId`
    FOREIGN KEY (`userId`)
    REFERENCES `vita_health`.`Users` (`userId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vita_health`.`Doctors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vita_health`.`Doctors` (
  `doctorId` INT NOT NULL AUTO_INCREMENT,
  `specialty` VARCHAR(255) NULL,
  `licenseNumber` VARCHAR(255) NULL,
  `userId` INT NOT NULL,
  PRIMARY KEY (`doctorId`),
  UNIQUE INDEX `licenseNumber_UNIQUE` (`licenseNumber` ASC) VISIBLE,
  INDEX `doctorsUserId_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `doctorsUserId`
    FOREIGN KEY (`userId`)
    REFERENCES `vita_health`.`Users` (`userId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vita_health`.`RecordTypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vita_health`.`RecordTypes` (
  `recordTypeId` INT NOT NULL AUTO_INCREMENT,
  `recordName` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`recordTypeId`),
  UNIQUE INDEX `recordName_UNIQUE` (`recordName` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vita_health`.`MedicalRecords`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vita_health`.`MedicalRecords` (
  `recordId` INT NOT NULL AUTO_INCREMENT,
  `patientId` INT NOT NULL,
  `recordTypeId` INT NOT NULL,
  `recordData` LONGTEXT NULL,
  `dateCreated` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`recordId`),
  INDEX `medicalRecordsPatientId_idx` (`patientId` ASC) VISIBLE,
  INDEX `medicalRecordsTypeId_idx` (`recordTypeId` ASC) VISIBLE,
  CONSTRAINT `medicalRecordsPatientId`
    FOREIGN KEY (`patientId`)
    REFERENCES `vita_health`.`Patients` (`patientId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `medicalRecordsTypeId`
    FOREIGN KEY (`recordTypeId`)
    REFERENCES `vita_health`.`RecordTypes` (`recordTypeId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vita_health`.`Tokens`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vita_health`.`Tokens` (
  `tokenId` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(255) NOT NULL,
  `patientId` INT NOT NULL,
  `dateCreated` DATETIME NOT NULL DEFAULT NOW(),
  `expirationDate` DATETIME NOT NULL,
  PRIMARY KEY (`tokenId`),
  INDEX `tokensPatientId_idx` (`patientId` ASC) VISIBLE,
  CONSTRAINT `tokensPatientId`
    FOREIGN KEY (`patientId`)
    REFERENCES `vita_health`.`Patients` (`patientId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vita_health`.`TokenAccess`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vita_health`.`TokenAccess` (
  `tokenAccessId` INT NOT NULL AUTO_INCREMENT,
  `tokenId` INT NOT NULL,
  `accessTime` DATETIME NOT NULL DEFAULT NOW(),
  `doctorId` INT NOT NULL,
  PRIMARY KEY (`tokenAccessId`),
  INDEX `tokenAccessTokenId_idx` (`tokenId` ASC) VISIBLE,
  INDEX `tokenAccessDoctorId_idx` (`doctorId` ASC) VISIBLE,
  CONSTRAINT `tokenAccessTokenId`
    FOREIGN KEY (`tokenId`)
    REFERENCES `vita_health`.`Tokens` (`tokenId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `tokenAccessDoctorId`
    FOREIGN KEY (`doctorId`)
    REFERENCES `vita_health`.`Doctors` (`doctorId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Fill Table `vita_health`.`Users`
-- -----------------------------------------------------
INSERT INTO `vita_health`.`Users` (`firstName`, `lastName`, `email`,
`userType`, `password`, `acceptTerms`) VALUES
('John', 'Doe', 'john.doe@example.com', 'Patient', 'gAAAAABmjFhohl9fnj3zOzITtFx8bfOR8cXEVab_Lfb-ppcMu5dEo-2hwlJzoDA29yTDQCY2ov_L4F205nxzQIhstP6lixc57Q==', 1),
('Jane', 'Smith', 'jane.smith@example.com', 'Doctor', 'gAAAAABmjFjHy_qCV_YdYN26gehW9GTpFU0yoUDuke0dc3ck4tKdskTvp2Hid_xZCmoAZUS1CN7jK0W7GHp4uT4l_gsqMXihPQ==', 1),
('Emily', 'Johnson', 'emily.johnson@example.com', 'Patient', 'gAAAAABmjFjclLj-tfhXEPycoo08y7bPVdEdd41b5ubD3xDb3FhgnVd2VQlVEdYaTzEeCVRg-7ONvkyY_8YI-UulIzTyV2-CJA==', 1),
('Michael', 'Brown', 'michael.brown@example.com', 'Doctor', 'gAAAAABmjFjyEj5f-NIsuYg7s2YCHpNXjPbTXmV40tfTtpevBlLQLKdb7qMSh4yBwTuyci3s-cNlODh39TWePcW_mnzXWbxiCQ==', 1),
('Sarah', 'Wilson', 'sarah.wilson@example.com', 'Patient', 'gAAAAABmjFknXkAD-haeLWL6t45KWQdLViodlTceFqtgruCjKLRyg84zKt1f1K5f8MQylf9vv9ushJRO118VrSqhb2IWgLgb-A==', 1),
('Tom', 'Brad', 'tom.brad@example.com', 'Doctor', 'gAAAAABmjFlV2ezsDdIzkkTjrqDKthtVBNzivJgA6CIUvduqiVbN2PlEn0TytNvbpzdM-q59wWxxDmSSd8WH7qXmPc64E9tizA==', 1),
('Adam', 'Sand', 'adam.sand@example.com', 'Patient', 'gAAAAABmjFlndokfBnRgzrcP-nDq-svSpjYpjhU6-HuNbVte_Bpm8YymT2woxTYqv6qpnhvtJQZljye1F3SsG4XdHfaJzjPkFw==', 1),
('Emma', 'Park', 'ema.park@example.com', 'Doctor', 'gAAAAABmjFmEtGz4ACW531XTPVWykWOxJd8vyiPQu4M5at_kqKmSCTyECTxqz4RcvW02BHRjj_YpL_PKTqyUFwQa7z-W1uRMJA==', 1),
('Peter', 'Mel', 'peter.mel@example.com', 'Patient', 'gAAAAABmjFmzmrkxPRpDiqL6dctMC2ZLYUmwY6GQHEEzsjqsFhBLLvTKmUQlPW8hPJGDiMtXQrejvRVDhvW0ZyBRZOr2FeovSg==', 1),
('Dina', 'Hank', 'dina.hank@example.com', 'Doctor', 'gAAAAABmjFnLAsTFwSifdMvftS1b1kGu4M3SqSfOkutydUoQgrld069T3eHwO8PW1eCoATnN96A84CPsE-08LIeHsrEL6j-YAg==', 1) ;


-- -----------------------------------------------------
-- Fill Table `vita_health`.`Patients`
-- -----------------------------------------------------
INSERT INTO `vita_health`.`Patients` (`dateOfBirth`, `gender`, `userId`)
VALUES
('1980-05-15', 'male', 1),
('1992-09-23', 'female', 3),
('1985-11-30', 'female', 5),
('1978-02-20', 'male', 7),
('1990-08-12', 'other', 9) ;


-- -----------------------------------------------------
-- Fill Table `vita_health`.`Doctors`
-- -----------------------------------------------------
INSERT INTO `vita_health`.`Doctors` (`specialty`, `licenseNumber`, `userId`)
VALUES
('Cardiology', 'CARD1234', 2),
('Neurology', 'NEUR5678', 4),
('Pediatrics', 'PEDI9101', 6),
('Dermatology', 'DERM1121', 8),
('Orthopedics', 'ORTH3141', 10) ;


-- -----------------------------------------------------
-- Fill Table `vita_health`.`RecordTypes`
-- -----------------------------------------------------
INSERT INTO `vita_health`.`RecordTypes` (`recordName`)
VALUES
('Blood Test'),
('MRI Scan'),
('X-Ray'),
('Ultrasound'),
('ECG') ;


-- -----------------------------------------------------
-- Fill Table `vita_health`.`MedicalRecords`
-- -----------------------------------------------------
INSERT INTO `vita_health`.`MedicalRecords` (`patientId`, `recordTypeId`, `recordData`)
VALUES
(1, 1, 'Blood test results: Hemoglobin: 14, WBC: 6.7'),
(2, 2, 'MRI results: No abnormalities detected'),
(3, 3, 'X-Ray results: Fracture in left arm'),
(4, 4, 'Ultrasound results: Normal'),
(5, 5, 'ECG results: Sinus rhythm, no abnormalities') ;


-- -----------------------------------------------------
-- Fill Table `vita_health`.`Tokens`
-- -----------------------------------------------------
INSERT INTO `vita_health`.`Tokens` (`token`, `patientId`, `expirationDate`)
VALUES
('token123', 1, '2024-07-01'),
('token456', 2, '2024-07-01'),
('token789', 3, '2024-07-01'),
('token101', 4, '2024-07-01'),
('token112', 5, '2024-07-01') ;


-- -----------------------------------------------------
-- Fill Table `vita_health`.`TokenAccess`
-- -----------------------------------------------------
INSERT INTO `vita_health`.`TokenAccess` (`tokenId`, `doctorId`)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5) ;


-- -----------------------------------------------------
-- Create Procedure to create user
-- -----------------------------------------------------
DELIMITER //
CREATE PROCEDURE AddUser(IN EMAIL VARCHAR(255), IN FTNM VARCHAR(255), IN LTNM VARCHAR(255), IN PASW VARCHAR(255), IN USTY ENUM('Patient', 'Doctor'), IN ACTR TINYINT)
BEGIN
DECLARE userConfirmation VARCHAR(45);
DECLARE userError VARCHAR(45);
PREPARE CountUsers FROM 'SELECT COUNT(`userId`) INTO @countUsers FROM `Users` WHERE `email` = ?' ;
PREPARE InsertIntoUsers FROM 'INSERT INTO `vita_health`.`Users` (`email`, `firstName`, `lastName`, `password`,
`userType`, `acceptTerms`) VALUES (?, ?, ?, ?, ?, ?)' ;
START TRANSACTION;
SET @email = EMAIL;
SET @firstName = FTNM;
SET @lastName = LTNM;
SET @password = PASW;
SET @userType = USTY;
SET @acceptTerms = ACTR;
EXECUTE CountUsers USING @email ;
IF  @countUsers > 0 THEN
  ROLLBACK ;
	SET userError = 'This e-mail already exists' ;
ELSEIF @acceptTerms != 1 THEN
	ROLLBACK ;
  SET userError = 'You must accept the terms and conditions' ;
ELSE
	EXECUTE InsertIntoUsers USING @email, @firstName, @lastName, @password, @userType, @acceptTerms ;
  EXECUTE CountUsers USING @email ;
  IF @countUsers = 1 THEN
    COMMIT ;
		SET userConfirmation = 'User created!' ;
	ELSE
		ROLLBACK;
		SET userError = 'User NOT created' ;
	END IF ;
END IF ;
SELECT * FROM(
  (SELECT userConfirmation) userConfirmation,
  (SELECT userError) userError
);
END //
DELIMITER ;


-- -----------------------------------------------------
-- Create Procedure to create patient or doctor user
-- -----------------------------------------------------
DELIMITER //
CREATE PROCEDURE AddPatientOrDoctorUser(IN USID INT, IN USTY ENUM('Patient', 'Doctor'))
BEGIN
DECLARE userConfirmation VARCHAR(45);
DECLARE userError VARCHAR(45);
PREPARE CountUsers FROM 'SELECT COUNT(`userId`) INTO @countUsers FROM `Users` WHERE `userId` = ?' ;
PREPARE CountPatients FROM 'SELECT COUNT(`userId`) INTO @countPatients FROM `Patients` WHERE `userId` = ?' ;
PREPARE CountDoctors FROM 'SELECT COUNT(`userId`) INTO @countDoctors FROM `Doctors` WHERE `userId` = ?' ;
PREPARE InsertIntoPatients FROM 'INSERT INTO `vita_health`.`Patients` (`userId`) VALUES (?)' ;
PREPARE InsertIntoDoctors FROM 'INSERT INTO `vita_health`.`Doctors` (`userId`) VALUES (?)' ;
START TRANSACTION;
SET @userId = USID;
SET @userType = USTY;
EXECUTE CountUsers USING @userId ;
EXECUTE CountPatients USING @userId ;
EXECUTE CountDoctors USING @userId ;
IF @countUsers != 1 THEN
	ROLLBACK ;
	SET userError = 'User does not exist' ;
ELSEIF  @countPatients > 0 OR @countDoctors > 0 THEN
  ROLLBACK ;
	SET userError = 'This user already exists' ;
ELSEIF @userType = 'Patient' THEN
	EXECUTE InsertIntoPatients USING @userId ;
  EXECUTE CountPatients USING @userId ;
  IF @countPatients = 1 THEN
    COMMIT ;
		SET userConfirmation = 'User created!' ;
	ELSE
		ROLLBACK;
		SET userError = 'User NOT created' ;
	END IF ;
ELSEIF @userType = 'Doctor' THEN
	EXECUTE InsertIntoDoctors USING @userId ;
  EXECUTE CountDoctors USING @userId ;
  IF @countDoctors = 1 THEN
    COMMIT ;
		SET userConfirmation = 'User created!' ;
	ELSE
		ROLLBACK;
		SET userError = 'User NOT created' ;
	END IF ;
END IF ;
SELECT * FROM(
  (SELECT userConfirmation) userConfirmation,
  (SELECT userError) userError
);
END //
DELIMITER ;


-- -----------------------------------------------------
-- Create Procedure to reserve tokenId
-- -----------------------------------------------------
DELIMITER //
CREATE PROCEDURE reserveTokenId(IN TK LONGTEXT, IN PTID INT, IN EXP DATETIME)
BEGIN
DECLARE tokenConfirmation VARCHAR(45);
DECLARE tokenError VARCHAR(45);
PREPARE CountPreviousToken FROM 'SELECT COUNT(`tokenId`) INTO @countPreviousToken FROM `vita_health`.`Tokens`
	WHERE `token` = ? AND `patientId` = ? AND `expirationDate` = ?' ;
PREPARE InsertIntoTokens FROM 'INSERT INTO `vita_health`.`Tokens` (`token`, `patientId`, `expirationDate`)
	VALUES (?, ?, ?)' ;
PREPARE CountToken FROM 'SELECT COUNT(`tokenId`) INTO @countToken FROM `vita_health`.`Tokens`
	WHERE `token` = ? AND `patientId` = ? AND `expirationDate` = ?' ;
START TRANSACTION;
SET @issuedToken = TK;
SET @patientId = PTID;
SET @expirationDate = EXP;
IF @expirationDate < NOW() THEN
	ROLLBACK ;
	SET tokenError = 'Expired date' ;
ELSE
	EXECUTE CountPreviousToken USING @issuedToken, @patientId, @expirationDate ;
	EXECUTE InsertIntoTokens USING @issuedToken, @patientId, @expirationDate ;
  EXECUTE CountToken USING @issuedToken, @patientId, @expirationDate ;
  IF @countToken - @countPreviousToken = 1 THEN
    COMMIT ;
    SET tokenConfirmation = 'Reserved TokenId' ;
	ELSE
		ROLLBACK ;
    SET tokenError = 'TokenId NOT reserved' ;
	END IF ;
END IF ;
SELECT * FROM(
  (SELECT tokenConfirmation) tokenConfirmation,
  (SELECT tokenError) tokenError,
  (SELECT LAST_INSERT_ID() AS tokenId) tokenId
);
END //
DELIMITER ;


-- -----------------------------------------------------
-- Create Procedure to add tokens
-- -----------------------------------------------------
DELIMITER //
CREATE PROCEDURE AddToken(IN TKID INT, IN TK LONGTEXT)
BEGIN
DECLARE tokenConfirmation VARCHAR(45);
DECLARE tokenError VARCHAR(45);
PREPARE UpdateToken FROM 'UPDATE `vita_health`.`Tokens` SET `token` = ? WHERE `tokenId` = ?' ;
PREPARE CountTokenId  FROM 'SELECT COUNT(`tokenId`) INTO @countTokenId FROM `vita_health`.`Tokens`
	WHERE `token` = ? AND `tokenId` = ?' ;
START TRANSACTION;
SET @reservedTokenId = TKID;
SET @issuedToken = TK;
EXECUTE UpdateToken USING @issuedToken, @reservedTokenId ;
EXECUTE CountTokenId USING @issuedToken, @reservedTokenId ;
IF @countTokenId != 1 THEN
	ROLLBACK ;
  SET tokenError = 'Token NOT registered' ;
ELSE
  COMMIT;
	SET tokenConfirmation = 'Registered Token' ;
END IF ;
SELECT * FROM(
  (SELECT tokenConfirmation) tokenConfirmation,
  (SELECT tokenError) tokenError
);
END //
DELIMITER ;


-- -----------------------------------------------------
-- Create Procedure to add tokens access
-- -----------------------------------------------------
DELIMITER //
CREATE PROCEDURE AddTokenAccess(IN TKID INT, IN DTID INT)
BEGIN
DECLARE accessConfirmation VARCHAR(45);
DECLARE accessError VARCHAR(45);
PREPARE CountPreviousTokenAccess FROM 'SELECT COUNT(`tokenId`) INTO @countPreviousTokenAccess FROM `vita_health`.`TokenAccess`
	WHERE `tokenId` = ?' ;
PREPARE InsertIntoTokenAccess FROM 'INSERT INTO `vita_health`.`TokenAccess` (`tokenId`, `doctorId`)
	VALUES (?, ?)' ;
PREPARE CountTokenAccess FROM 'SELECT COUNT(`tokenId`) INTO @countTokenAccess FROM `vita_health`.`TokenAccess`
	WHERE `tokenId` = ?' ;
START TRANSACTION;
SET @tokenId = TKID;
SET @doctorId = DTID;
EXECUTE CountPreviousTokenAccess USING @tokenId ;
EXECUTE InsertIntoTokenAccess USING @tokenId, @doctorId ;
EXECUTE CountTokenAccess USING @tokenId ;
IF @countTokenAccess - @countPreviousTokenAccess = 1 THEN
	COMMIT;
	SET accessConfirmation = 'Saved access' ;
ELSE
	ROLLBACK ;
  SET accessError = 'Access NOT saved' ;
END IF ;
SELECT * FROM(
  (SELECT accessConfirmation) accessConfirmation,
  (SELECT accessError) accessError
);
END //
DELIMITER ;
