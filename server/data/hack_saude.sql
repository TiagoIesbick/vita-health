-- MySQL Database - hack_saude Script

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema hack_saude
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `hack_saude` ;

-- -----------------------------------------------------
-- Schema hack_saude
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `hack_saude` DEFAULT CHARACTER SET utf8mb4 ;
USE `hack_saude` ;

-- -----------------------------------------------------
-- Table `hack_saude`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`Users` (
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
-- Table `hack_saude`.`Patients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`Patients` (
  `patientId` INT NOT NULL AUTO_INCREMENT,
  `dateOfBirth` DATE NULL,
  `gender` ENUM('male', 'female', 'other') NULL,
  `userId` INT NOT NULL,
  PRIMARY KEY (`patientId`),
  INDEX `patientsUserId_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `patientsUserId`
    FOREIGN KEY (`userId`)
    REFERENCES `hack_saude`.`Users` (`userId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `hack_saude`.`Doctors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`Doctors` (
  `doctorId` INT NOT NULL AUTO_INCREMENT,
  `specialty` VARCHAR(255) NULL,
  `licenseNumber` VARCHAR(255) NULL,
  `userId` INT NOT NULL,
  PRIMARY KEY (`doctorId`),
  UNIQUE INDEX `licenseNumber_UNIQUE` (`licenseNumber` ASC) VISIBLE,
  INDEX `doctorsUserId_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `doctorsUserId`
    FOREIGN KEY (`userId`)
    REFERENCES `hack_saude`.`Users` (`userId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `hack_saude`.`RecordTypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`RecordTypes` (
  `recordTypeId` INT NOT NULL AUTO_INCREMENT,
  `recordName` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`recordTypeId`),
  UNIQUE INDEX `recordName_UNIQUE` (`recordName` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `hack_saude`.`MedicalRecords`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`MedicalRecords` (
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
    REFERENCES `hack_saude`.`Patients` (`patientId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `medicalRecordsTypeId`
    FOREIGN KEY (`recordTypeId`)
    REFERENCES `hack_saude`.`RecordTypes` (`recordTypeId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `hack_saude`.`Tokens`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`Tokens` (
  `tokenId` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(255) NOT NULL,
  `patientId` INT NOT NULL,
  `dateCreated` DATETIME NOT NULL DEFAULT NOW(),
  `expirationDate` DATETIME NOT NULL,
  PRIMARY KEY (`tokenId`),
  INDEX `tokensPatientId_idx` (`patientId` ASC) VISIBLE,
  CONSTRAINT `tokensPatientId`
    FOREIGN KEY (`patientId`)
    REFERENCES `hack_saude`.`Patients` (`patientId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `hack_saude`.`TokenAccess`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`TokenAccess` (
  `tokenAccessId` INT NOT NULL AUTO_INCREMENT,
  `tokenId` INT NOT NULL,
  `accessTime` DATETIME NOT NULL DEFAULT NOW(),
  `doctorId` INT NOT NULL,
  PRIMARY KEY (`tokenAccessId`),
  INDEX `tokenAccessTokenId_idx` (`tokenId` ASC) VISIBLE,
  INDEX `tokenAccessDoctorId_idx` (`doctorId` ASC) VISIBLE,
  CONSTRAINT `tokenAccessTokenId`
    FOREIGN KEY (`tokenId`)
    REFERENCES `hack_saude`.`Tokens` (`tokenId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `tokenAccessDoctorId`
    FOREIGN KEY (`doctorId`)
    REFERENCES `hack_saude`.`Doctors` (`doctorId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Fill Table `hack_saude`.`Users`
-- -----------------------------------------------------
INSERT INTO `hack_saude`.`Users` (`firstName`, `lastName`, `email`,
`userType`, `password`, `acceptTerms`) VALUES
('John', 'Doe', 'john.doe@example.com', 'Patient', 'gAAAAABmdjVDuFGdiYvHpoIvF3IkEa6jiXsKx53JJv-ewfaVxzMVyW_pI9iJ31mrHE13-O851e1Y0HdN20C6UocVJrMIWn3R3A==', 1),
('Jane', 'Smith', 'jane.smith@example.com', 'Doctor', 'gAAAAABmdjVJdsVXcoOUnbYsdxOhbhXuZKXTGXRF8ENp-x1GxV4xInNjjEf43krRd9qIWDRr4XW_LmQH4MuWq8FqjEs1gM_4SQ==', 1),
('Emily', 'Johnson', 'emily.johnson@example.com', 'Patient', 'gAAAAABmdjWn2Bqif4SKl5nlW4Rhjq71tjnV_MhV5Jf07eN9c0fHgftrFvO0F1r0GMTq7Nfl81ytkm55BU4Ld9psuF3azrcFzg==', 1),
('Michael', 'Brown', 'michael.brown@example.com', 'Doctor', 'gAAAAABmdjW7U6a5dIIUPCMucyLmiWZfvVe9qhW_N2_g0_JqBbIF9oL_NtrS0Gr90vShS9Es5H3Hm19KthMV9AOTcdv_Yhjy9g==', 1),
('Sarah', 'Wilson', 'sarah.wilson@example.com', 'Patient', 'gAAAAABmdjXQ06t3zM6rfaunHwWRGdDA1Vtf8flvDkMue2OFu_5lmBs7YpdGSFw_Ht4hqWHN91iIDuWYC480jeeewXEAmgUsKA==', 1),
('Tom', 'Brad', 'tom.brad@example.com', 'Doctor', 'gAAAAABmdjXtQnyrdWW-iaXMdlpx6hokM7RIQr8xHRnqLeaRDoiEyQkzWRd1coG1c3D96N-1JF-9i95y4oMiOJ4sKi6OJphbOg==', 1),
('Adam', 'Sand', 'adam.sand@example.com', 'Patient', 'gAAAAABmdjX_36IDYNZ9fbTcvS0BQl9KytdjYlpGaG6Jkc9bUPiLpVsLuywQSmgMChMYhaqS0PeQsv5l2kMBehWIPQ3bdNuWLQ==', 1),
('Emma', 'Park', 'ema.park@example.com', 'Doctor', 'gAAAAABmdjYNDrtOlybN0g1ELGj0G44hBiSEHD7zfc2X4MNWHCmp60UN9o_vDQnN3vdgK4m_94jRkr1IXLQ5P1Cyhexa_AR6tg==', 1),
('Peter', 'Mel', 'peter.mel@example.com', 'Patient', 'gAAAAABmdjYdeq3QpFMxJgzQFsapBCIPQZZd3XcZjprX_a5g2u0gKlZcKfkPbGvHyd0CnVWUVIIWbw4WECfiAyvsUmv4TZwqhw==', 1),
('Dina', 'Hank', 'dina.hank@example.com', 'Doctor', 'gAAAAABmdjYvvtC59OvcXMqsXRn3BEyilWCrre6PGLz76FVPjsJPsGf4LWYjkLF7todgaBcUMCApWN65nYJX9iiyNIenWMdQRg==', 1) ;


-- -----------------------------------------------------
-- Fill Table `hack_saude`.`Patients`
-- -----------------------------------------------------
INSERT INTO `hack_saude`.`Patients` (`dateOfBirth`, `gender`, `userId`)
VALUES
('1980-05-15', 'male', 1),
('1992-09-23', 'female', 3),
('1985-11-30', 'female', 5),
('1978-02-20', 'male', 7),
('1990-08-12', 'other', 9) ;


-- -----------------------------------------------------
-- Fill Table `hack_saude`.`Doctors`
-- -----------------------------------------------------
INSERT INTO `hack_saude`.`Doctors` (`specialty`, `licenseNumber`, `userId`)
VALUES
('Cardiology', 'CARD1234', 2),
('Neurology', 'NEUR5678', 4),
('Pediatrics', 'PEDI9101', 6),
('Dermatology', 'DERM1121', 8),
('Orthopedics', 'ORTH3141', 10) ;


-- -----------------------------------------------------
-- Fill Table `hack_saude`.`RecordTypes`
-- -----------------------------------------------------
INSERT INTO `hack_saude`.`RecordTypes` (`recordName`)
VALUES
('Blood Test'),
('MRI Scan'),
('X-Ray'),
('Ultrasound'),
('ECG') ;


-- -----------------------------------------------------
-- Fill Table `hack_saude`.`MedicalRecords`
-- -----------------------------------------------------
INSERT INTO `hack_saude`.`MedicalRecords` (`patientId`, `recordTypeId`, `recordData`)
VALUES
(1, 1, 'Blood test results: Hemoglobin: 14, WBC: 6.7'),
(2, 2, 'MRI results: No abnormalities detected'),
(3, 3, 'X-Ray results: Fracture in left arm'),
(4, 4, 'Ultrasound results: Normal'),
(5, 5, 'ECG results: Sinus rhythm, no abnormalities') ;


-- -----------------------------------------------------
-- Fill Table `hack_saude`.`Tokens`
-- -----------------------------------------------------
INSERT INTO `hack_saude`.`Tokens` (`token`, `patientId`, `expirationDate`)
VALUES
('token123', 1, '2024-07-01'),
('token456', 2, '2024-07-01'),
('token789', 3, '2024-07-01'),
('token101', 4, '2024-07-01'),
('token112', 5, '2024-07-01') ;


-- -----------------------------------------------------
-- Fill Table `hack_saude`.`TokenAccess`
-- -----------------------------------------------------
INSERT INTO `hack_saude`.`TokenAccess` (`tokenId`, `doctorId`)
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
PREPARE InsertIntoUsers FROM 'INSERT INTO `hack_saude`.`Users` (`email`, `firstName`, `lastName`, `password`,
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
  ROLLBACK;
	SET userError = 'Este e-mail já existe' ;
ELSEIF @acceptTerms != 1 THEN
	ROLLBACK;
  SET userError = 'É preciso aceitar os termos e condições' ;
ELSE
	EXECUTE InsertIntoUsers USING @email, @firstName, @lastName, @password, @userType, @acceptTerms ;
	COMMIT;
  EXECUTE CountUsers USING @email ;
  IF @countUsers = 1 THEN
		SET userConfirmation = 'Usuário criado!' ;
	ELSE
		ROLLBACK;
		SET userError = 'Usuário NÃO criado' ;
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
PREPARE InsertIntoPatients FROM 'INSERT INTO `hack_saude`.`Patients` (`userId`) VALUES (?)' ;
PREPARE InsertIntoDoctors FROM 'INSERT INTO `hack_saude`.`Doctors` (`userId`) VALUES (?)' ;
START TRANSACTION;
SET @userId = USID;
SET @userType = USTY;
EXECUTE CountUsers USING @userId ;
EXECUTE CountPatients USING @userId ;
EXECUTE CountDoctors USING @userId ;
IF @countUsers != 1 THEN
	ROLLBACK;
	SET userError = 'Usuário não existe' ;
ELSEIF  @countPatients > 0 OR @countDoctors > 0 THEN
  ROLLBACK;
	SET userError = 'Este usuário já existe' ;
ELSEIF @userType = 'Patient' THEN
	EXECUTE InsertIntoPatients USING @userId ;
	COMMIT;
    EXECUTE CountPatients USING @userId ;
    IF @countPatients = 1 THEN
		SET userConfirmation = 'Usuário criado!' ;
	ELSE
		ROLLBACK;
		SET userError = 'Usuário NÃO criado' ;
	END IF ;
ELSEIF @userType = 'Doctor' THEN
	EXECUTE InsertIntoDoctors USING @userId ;
    COMMIT;
    EXECUTE CountDoctors USING @userId ;
    IF @countDoctors = 1 THEN
		SET userConfirmation = 'Usuário criado!' ;
	ELSE
		ROLLBACK;
		SET userError = 'Usuário NÃO criado' ;
	END IF ;
END IF ;
SELECT * FROM(
  (SELECT userConfirmation) userConfirmation,
  (SELECT userError) userError
);
END //
DELIMITER ;


-- -----------------------------------------------------
-- Create Procedure to add tokens
-- -----------------------------------------------------
DELIMITER //
CREATE PROCEDURE AddToken(IN TK LONGTEXT, IN PTID INT, IN EXP DATETIME)
BEGIN
DECLARE tokenConfirmation VARCHAR(45);
DECLARE tokenError VARCHAR(45);
PREPARE InsertIntoTokens FROM 'INSERT INTO `hack_saude`.`Tokens` (`token`, `patientId`, `expirationDate`)
	VALUES (?, ?, ?)' ;
START TRANSACTION;
SET @issuedToken = TK;
SET @patientId = PTID;
SET @expirationDate = EXP;
IF @expirationDate < NOW() THEN
	ROLLBACK;
	SET tokenError = 'Data expirada' ;
ELSE
	EXECUTE InsertIntoTokens USING @issuedToken, @patientId, @expirationDate ;
    COMMIT;
	SET tokenConfirmation = 'Token emitido' ;
END IF ;
SELECT * FROM(
  (SELECT tokenConfirmation) tokenConfirmation,
  (SELECT tokenError) tokenError,
  (SELECT LAST_INSERT_ID() AS tokenId) tokenId
);
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE AddTokenAccess(IN TKID INT, IN DTID INT)
BEGIN
DECLARE accessConfirmation VARCHAR(45);
DECLARE accessError VARCHAR(45);
PREPARE CountPreviousTokenAccess FROM 'SELECT COUNT(`tokenId`) INTO @countPreviousTokenAccess FROM `hack_saude`.`TokenAccess`
	WHERE `tokenId` = ?' ;
PREPARE InsertIntoTokenAccess FROM 'INSERT INTO `hack_saude`.`TokenAccess` (`tokenId`, `doctorId`)
	VALUES (?, ?)' ;
PREPARE CountTokenAccess FROM 'SELECT COUNT(`tokenId`) INTO @countTokenAccess FROM `hack_saude`.`TokenAccess`
	WHERE `tokenId` = ?' ;
START TRANSACTION;
SET @tokenId = TKID;
SET @doctorId = DTID;
EXECUTE CountPreviousTokenAccess USING @tokenId ;
EXECUTE InsertIntoTokenAccess USING @tokenId, @doctorId ;
EXECUTE CountTokenAccess USING @tokenId ;
IF @countTokenAccess - @countPreviousTokenAccess = 1 THEN
	COMMIT;
	SET accessConfirmation = 'Acesso salvo' ;
ELSE
	ROLLBACK ;
  SET accessError = 'Acesso NÃO salvo' ;
END IF ;
SELECT * FROM(
  (SELECT accessConfirmation) accessConfirmation,
  (SELECT accessError) accessError
);
END //
DELIMITER ;
