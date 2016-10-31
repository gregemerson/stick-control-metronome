-- MySQL dump 10.13  Distrib 5.7.12, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: scm_v1
-- ------------------------------------------------------
-- Server version	5.7.15-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accesstoken`
--

DROP TABLE IF EXISTS `accesstoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accesstoken` (
  `id` varchar(255) NOT NULL,
  `ttl` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accesstoken`
--

LOCK TABLES `accesstoken` WRITE;
/*!40000 ALTER TABLE `accesstoken` DISABLE KEYS */;
INSERT INTO `accesstoken` VALUES ('MCLXGi20lLDTXRBTWkiz7sbQXRx5qk8IPEcwTFBhlYPTDfG0WZDDAhjYHDuIaBEX',1209600000,'2016-10-06 03:14:15',5),('S82xW1rFzR7G74lutYbb8Hh1phlGND7Ud1dRhxTYSa4a9TiUIg1IrW2xbCHvkT48',1209600,'2016-10-21 23:15:06',4);
/*!40000 ALTER TABLE `accesstoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `acl`
--

DROP TABLE IF EXISTS `acl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `acl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model` varchar(512) DEFAULT NULL,
  `property` varchar(512) DEFAULT NULL,
  `accessType` varchar(512) DEFAULT NULL,
  `permission` varchar(512) DEFAULT NULL,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acl`
--

LOCK TABLES `acl` WRITE;
/*!40000 ALTER TABLE `acl` DISABLE KEYS */;
/*!40000 ALTER TABLE `acl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime DEFAULT NULL,
  `username` varchar(40) NOT NULL,
  `membershipExpiry` datetime DEFAULT NULL,
  `realm` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `credentials` text,
  `challenges` text,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  `status` varchar(512) DEFAULT NULL,
  `lastUpdated` datetime DEFAULT NULL,
  `clientId` int(11) DEFAULT NULL,
  `_userSettings` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
INSERT INTO `client` VALUES (4,'2016-10-06 03:03:19','gemerson','1900-01-01 05:00:00',NULL,'$2a$10$0wF0JPJNBN5uVRdD9Fkf7uTrOvi.hjt9wL6WjaXnFtxO97gVRfdBC',NULL,NULL,'amazatron@hotmail.com',1,NULL,NULL,'2016-10-06 03:03:19',NULL,'{\"currentExerciseSet\":\"-1\",\"numberOfRepititions\":20,\"minTempo\":80,\"maxTempo\":80,\"tempoStep\":10}'),(5,'2016-10-06 03:08:12','guest','1900-01-01 05:00:00',NULL,'$2a$10$UZyy74iwtAsmzLrlKvixqe36KPzoMrYkSx321VFI3NjZpF5QC2lvC',NULL,NULL,'guest@guest.com',1,NULL,NULL,'2016-10-06 03:08:12',NULL,'{\"currentExerciseSet\":\"-1\",\"numberOfRepititions\":20,\"minTempo\":80,\"maxTempo\":80,\"tempoStep\":10}');
/*!40000 ALTER TABLE `client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise`
--

DROP TABLE IF EXISTS `exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercise` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime DEFAULT NULL,
  `name` varchar(40) DEFAULT NULL,
  `notation` varchar(600) DEFAULT NULL,
  `isPublic` tinyint(1) DEFAULT NULL,
  `category` varchar(20) NOT NULL,
  `comments` varchar(300) DEFAULT NULL,
  `ownerId` int(11) DEFAULT NULL,
  `clientId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise`
--

LOCK TABLES `exercise` WRITE;
/*!40000 ALTER TABLE `exercise` DISABLE KEYS */;
INSERT INTO `exercise` VALUES (1,'2016-10-05 23:31:29','B1','#rlrl rlrl rlrl rlrl',1,'Basic',NULL,4,4),(2,'2016-10-05 23:31:29','B2','#lrlr lrlr lrlr lrlr',1,'Basic',NULL,4,4),(3,'2016-10-05 23:31:29','B3','#rrll rrll rrll rrll',1,'Basic',NULL,4,4),(4,'2016-10-05 23:31:29','B4','#llrr llrr llrr llrr',1,'Basic',NULL,4,4),(5,'2016-10-05 23:31:29','B5','#rlrr lrll rlrr lrll',1,'Basic',NULL,4,4),(6,'2016-10-05 23:31:29','B6','#rllr lrrl rllr lrrl',1,'Basic',NULL,4,4),(7,'2016-10-05 23:31:29','B7','#rrlr llrl rrlr llrl',1,'Basic',NULL,4,4),(8,'2016-10-05 23:31:29','B8','#rlrl lrlr rlrl lrlr',1,'Basic',NULL,4,4),(9,'2016-10-05 23:31:29','B9','#rrrl rrrl rrrl rrrl',1,'Basic',NULL,4,4),(10,'2016-10-05 23:31:29','B10','#rlll rlll rlll rlll',1,'Basic',NULL,4,4),(11,'2016-10-05 23:31:29','B11','#lllr lllr lllr lllr',1,'Basic',NULL,4,4),(12,'2016-10-05 23:31:29','B12','#lrrr lrrr lrrr lrrr',1,'Basic',NULL,4,4),(13,'2016-10-05 23:31:29','B13','#rrrr llll rrrr llll',1,'Basic',NULL,4,4),(14,'2016-10-05 23:31:29','B14','#rlrl rrll rlrl rrll',1,'Basic',NULL,4,4),(15,'2016-10-05 23:31:29','B15','#lrlr llrr lrlr llrr',1,'Basic',NULL,4,4),(16,'2016-10-05 23:31:29','B16','#rlrl rlrr lrlr lrll',1,'Basic',NULL,4,4),(17,'2016-10-05 23:31:29','B17','#rlrl rllr lrlr lrrl',1,'Basic',NULL,4,4),(18,'2016-10-05 23:31:29','B18','#rlrl rrlr lrlr llrl',1,'Basic',NULL,4,4),(19,'2016-10-05 23:31:29','B19','#rlrl rrrl rlrl rrrl',1,'Basic',NULL,4,4),(20,'2016-10-05 23:31:29','B20','#rlrl rlll rlrl rlll',1,'Basic',NULL,4,4),(21,'2016-10-05 23:31:29','B21','#lrlr lllr lrlr lllr',1,'Basic',NULL,4,4),(22,'2016-10-05 23:31:29','B22','#lrlr lrrr lrlr lrrr',1,'Basic',NULL,4,4),(23,'2016-10-05 23:31:29','B23','#rlrl rrrr lrlr llll',1,'Basic',NULL,4,4),(24,'2016-10-05 23:31:29','B24','#rrll rlrr llrr lrll',1,'Basic',NULL,4,4),(27,'2016-10-15 04:57:29','Repeats','#rlrl r-lr lrl- rlr-|lrlr|<1:3>|lrlr l-rl rlr- lrl-|rlrl|<1:3>',0,'Demonstration','The top number is the number of previous measures to repeat. The bottom number is the number of times to repeat those measures.',4,4);
/*!40000 ALTER TABLE `exercise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exerciseset`
--

DROP TABLE IF EXISTS `exerciseset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exerciseset` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime DEFAULT NULL,
  `name` varchar(40) DEFAULT NULL,
  `category` varchar(20) DEFAULT NULL,
  `disabledExercises` text,
  `exerciseOrdering` text,
  `ownerId` int(11) DEFAULT NULL,
  `clientId` int(11) DEFAULT NULL,
  `comments` varchar(500) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exerciseset`
--

LOCK TABLES `exerciseset` WRITE;
/*!40000 ALTER TABLE `exerciseset` DISABLE KEYS */;
INSERT INTO `exerciseset` VALUES (1,NULL,'Basic 1','Basic','[]','[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]',4,4,''),(2,NULL,'Notation Demo','Demonstration','[]','[27]',NULL,NULL,'Learn');
/*!40000 ALTER TABLE `exerciseset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercisesetexercise`
--

DROP TABLE IF EXISTS `exercisesetexercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercisesetexercise` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exerciseSetId` int(11) DEFAULT NULL,
  `exerciseId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exerciseSetId` (`exerciseSetId`),
  KEY `exerciseId` (`exerciseId`),
  CONSTRAINT `exercisesetexercise_ibfk_1` FOREIGN KEY (`exerciseSetId`) REFERENCES `exerciseset` (`id`),
  CONSTRAINT `exercisesetexercise_ibfk_2` FOREIGN KEY (`exerciseId`) REFERENCES `exercise` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercisesetexercise`
--

LOCK TABLES `exercisesetexercise` WRITE;
/*!40000 ALTER TABLE `exercisesetexercise` DISABLE KEYS */;
INSERT INTO `exercisesetexercise` VALUES (1,1,1),(2,1,2),(3,1,3),(4,1,4),(5,1,5),(6,1,6),(7,1,7),(8,1,8),(9,1,9),(10,1,10),(11,1,11),(12,1,12),(13,1,13),(14,1,14),(15,1,15),(16,1,16),(17,1,17),(18,1,18),(19,1,19),(20,1,20),(21,1,21),(22,1,22),(23,1,23),(24,1,24),(27,2,27);
/*!40000 ALTER TABLE `exercisesetexercise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicresource`
--

DROP TABLE IF EXISTS `publicresource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `publicresource` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `items` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicresource`
--

LOCK TABLES `publicresource` WRITE;
/*!40000 ALTER TABLE `publicresource` DISABLE KEYS */;
/*!40000 ALTER TABLE `publicresource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'guest',NULL,'2016-10-06 03:16:20','2016-10-06 03:16:20'),(2,'administrator',NULL,'2016-10-06 03:16:20','2016-10-06 03:16:20');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolemapping`
--

DROP TABLE IF EXISTS `rolemapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolemapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(512) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolemapping`
--

LOCK TABLES `rolemapping` WRITE;
/*!40000 ALTER TABLE `rolemapping` DISABLE KEYS */;
INSERT INTO `rolemapping` VALUES (1,'USER','5',1),(2,'USER','4',2);
/*!40000 ALTER TABLE `rolemapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `credentials` text,
  `challenges` text,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  `status` varchar(512) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `lastUpdated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usersettings`
--

DROP TABLE IF EXISTS `usersettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usersettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `currentExerciseSet` varchar(512) NOT NULL,
  `numberOfRepititions` int(11) NOT NULL,
  `minTempo` int(11) NOT NULL,
  `maxTempo` int(11) NOT NULL,
  `tempoStep` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usersettings`
--

LOCK TABLES `usersettings` WRITE;
/*!40000 ALTER TABLE `usersettings` DISABLE KEYS */;
/*!40000 ALTER TABLE `usersettings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-10-30  3:09:34
