-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_debttrack
-- ------------------------------------------------------
-- Server version	8.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `billresponsibilitydetails`
--

DROP TABLE IF EXISTS `billresponsibilitydetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billresponsibilitydetails` (
  `id` varchar(45) NOT NULL,
  `PayResponsible_id` varchar(45) NOT NULL,
  `bills_id` int NOT NULL,
  `numday` int DEFAULT NULL,
  `amount` float NOT NULL,
  PRIMARY KEY (`id`,`PayResponsible_id`,`bills_id`),
  KEY `fk_PayResponsible_has_bills_bills1_idx` (`bills_id`),
  KEY `fk_PayResponsible_has_bills_PayResponsible1_idx` (`PayResponsible_id`),
  CONSTRAINT `fk_PayResponsible_has_bills_bills1` FOREIGN KEY (`bills_id`) REFERENCES `bills` (`id`),
  CONSTRAINT `fk_PayResponsible_has_bills_PayResponsible1` FOREIGN KEY (`PayResponsible_id`) REFERENCES `payresponsible` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billresponsibilitydetails`
--

LOCK TABLES `billresponsibilitydetails` WRITE;
/*!40000 ALTER TABLE `billresponsibilitydetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `billresponsibilitydetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numday` int NOT NULL,
  `tax` float NOT NULL,
  `money` float NOT NULL,
  `non_tax` float NOT NULL,
  `bill_month` varchar(45) NOT NULL,
  `status` varchar(45) DEFAULT NULL,
  `date_regis` date NOT NULL,
  `bill_start` date NOT NULL,
  `bill_end` date NOT NULL,
  `system_date` date DEFAULT NULL,
  `employee_date` date DEFAULT NULL,
  `company_date` date DEFAULT NULL,
  `deferment_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
/*!40000 ALTER TABLE `bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` int NOT NULL,
  `ca` varchar(45) NOT NULL,
  `idpea` varchar(45) NOT NULL,
  `pea_position` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `address` varchar(45) NOT NULL,
  `Latitude` varchar(45) DEFAULT NULL,
  `Longitude` varchar(45) DEFAULT NULL,
  `bill_num` int DEFAULT NULL,
  `bill_amount` float DEFAULT NULL,
  `tel` varchar(10) DEFAULT NULL,
  `command` varchar(45) DEFAULT NULL,
  `number_meter` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_has_bills`
--

DROP TABLE IF EXISTS `customer_has_bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_has_bills` (
  `customer_id` int NOT NULL,
  `bills_id` int NOT NULL,
  PRIMARY KEY (`customer_id`,`bills_id`),
  KEY `fk_customer_has_bills_bills1_idx` (`bills_id`),
  KEY `fk_customer_has_bills_customer1_idx` (`customer_id`),
  CONSTRAINT `fk_customer_has_bills_bills1` FOREIGN KEY (`bills_id`) REFERENCES `bills` (`id`),
  CONSTRAINT `fk_customer_has_bills_customer1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_has_bills`
--

LOCK TABLES `customer_has_bills` WRITE;
/*!40000 ALTER TABLE `customer_has_bills` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_has_bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `rank` varchar(45) NOT NULL,
  `department` varchar(45) NOT NULL,
  `position` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holiday`
--

DROP TABLE IF EXISTS `holiday`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holiday` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `Description` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`Description`),
  UNIQUE KEY `ca_UNIQUE` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=1400 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holiday`
--

LOCK TABLES `holiday` WRITE;
/*!40000 ALTER TABLE `holiday` DISABLE KEYS */;
INSERT INTO `holiday` VALUES (1,'2024-05-01','แรงงาน');
/*!40000 ALTER TABLE `holiday` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payresponsible`
--

DROP TABLE IF EXISTS `payresponsible`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payresponsible` (
  `id` varchar(45) NOT NULL,
  `Responsibility_type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payresponsible`
--

LOCK TABLES `payresponsible` WRITE;
/*!40000 ALTER TABLE `payresponsible` DISABLE KEYS */;
/*!40000 ALTER TABLE `payresponsible` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-27  0:48:28
