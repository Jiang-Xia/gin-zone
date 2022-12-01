CREATE DATABASE `zone_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

-- zone_db.z_user definition

CREATE TABLE `z_user` (
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `user_id` bigint NOT NULL COMMENT '用户唯一id',
                          `nick_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '昵称',
                          `user_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名',
                          `password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码',
                          `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '邮箱',
                          `gender` tinyint NOT NULL DEFAULT '0' COMMENT '性别',
                          `is_lock` tinyint NOT NULL DEFAULT '0' COMMENT '是否锁定',
                          `is_admin` tinyint NOT NULL DEFAULT '0' COMMENT '是否可登录管理者',
                          `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
                          `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          PRIMARY KEY (`id`),
                          UNIQUE KEY `idx_user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;