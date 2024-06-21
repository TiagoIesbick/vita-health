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
  `userType` ENUM('patient', 'doctor') NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `acceptTerms` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`userId`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `hack_saude`.`Patients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`Patients` (
  `patientId` INT NOT NULL AUTO_INCREMENT,
  `dateOfBirth` DATE NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL,
  `userId` INT NULL,
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
  `specialty` VARCHAR(255) NOT NULL,
  `licenseNumber` VARCHAR(255) NOT NULL,
  `userId` INT NULL,
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
  `patientId` INT NULL,
  `recordTypeId` INT NULL,
  `recordData` LONGTEXT NULL,
  `dateCreated` DATETIME NULL DEFAULT NOW(),
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
  `patientId` INT NULL,
  `doctorId` INT NULL,
  `dateCreated` DATETIME NOT NULL DEFAULT NOW(),
  `expirationDate` DATETIME NOT NULL,
  PRIMARY KEY (`tokenId`),
  UNIQUE INDEX `token_UNIQUE` (`token` ASC) VISIBLE,
  INDEX `tokensPatientId_idx` (`patientId` ASC) VISIBLE,
  INDEX `tokensDoctorId_idx` (`doctorId` ASC) VISIBLE,
  CONSTRAINT `tokensPatientId`
    FOREIGN KEY (`patientId`)
    REFERENCES `hack_saude`.`Patients` (`patientId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `tokensDoctorId`
    FOREIGN KEY (`doctorId`)
    REFERENCES `hack_saude`.`Doctors` (`doctorId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `hack_saude`.`TokenAccess`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hack_saude`.`TokenAccess` (
  `tokenAccessId` INT NOT NULL AUTO_INCREMENT,
  `tokenId` INT NULL,
  `recordId` INT NULL,
  `accessTime` DATETIME NULL DEFAULT NOW(),
  PRIMARY KEY (`tokenAccessId`),
  INDEX `tokenAccessTokenId_idx` (`tokenId` ASC) VISIBLE,
  INDEX `tokenAccessRecordId_idx` (`recordId` ASC) VISIBLE,
  CONSTRAINT `tokenAccessTokenId`
    FOREIGN KEY (`tokenId`)
    REFERENCES `hack_saude`.`Tokens` (`tokenId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `tokenAccessRecordId`
    FOREIGN KEY (`recordId`)
    REFERENCES `hack_saude`.`MedicalRecords` (`recordId`)
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
('John', 'Doe', 'john.doe@example.com', 'patient', 'password123', 1),
('Jane', 'Smith', 'jane.smith@example.com', 'doctor', 'password123', 1),
('Emily', 'Johnson', 'emily.johnson@example.com', 'patient', 'password123', 1),
('Michael', 'Brown', 'michael.brown@example.com', 'doctor', 'password123', 1),
('Sarah', 'Wilson', 'sarah.wilson@example.com', 'patient', 'password123', 1),
('Tom', 'Brad', 'tom.brad@example.com', 'doctor', 'password123', 1),
('Adam', 'Sand', 'adam.sand@example.com', 'patient', 'password123', 1),
('Emma', 'Park', 'ema.park@example.com', 'doctor', 'password123', 1),
('Peter', 'Mel', 'peter.mel@example.com', 'patient', 'password123', 1),
('Dina', 'Hank', 'dina.hank@example.com', 'doctor', 'password123', 1) ;


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
INSERT INTO `hack_saude`.`Tokens` (`token`, `patientId`, `doctorId`, `expirationDate`)
VALUES
('token123', 1, 1, '2024-07-01'),
('token456', 2, 2, '2024-07-01'),
('token789', 3, 3, '2024-07-01'),
('token101', 4, 4, '2024-07-01'),
('token112', 5, 5, '2024-07-01') ;


-- -----------------------------------------------------
-- Fill Table `hack_saude`.`TokenAccess`
-- -----------------------------------------------------
INSERT INTO `hack_saude`.`TokenAccess` (`tokenId`, `recordId`)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5) ;