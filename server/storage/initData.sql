-- 默认用户
INSERT INTO zone_db.z_user (created_at,updated_at,user_id,user_name,password,is_admin,is_lock,wx_open_id,avatar,nick_name,intro,email,gender) VALUES
    ('2022-12-25 13:37:53.977000000','2022-12-29 20:13:04.428000000','85031682838528','admin','$2a$14$rnKFhzMdzRgTENh2Z83LD.o/ilqfrijTFL9814GAWl5yTsBdcEuf6',0,0,'oriMp4zFMz_iS5yPg3pdc4jmtMis','https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLJmXZRGvV6fWkUibWhUDG870MqBeYsBoPArxkgwt2l9WX5cYAdicnu7dgpD1wtcibwA5J0kkPEIUPIw/132','江夏','','',0);

-- 默认群组
INSERT INTO zone_db.z_chat_group (created_at,updated_at,group_name,user_id,intro,notice) VALUES
    (NULL,NULL,'聊天室001','85031682838528',NULL,NULL);
-- 默认群成员
INSERT INTO zone_db.z_chat_group_member (created_at,updated_at,user_id,group_id) VALUES
    ('2023-01-07 17:21:12.215000000','2023-01-07 17:21:12.215000000','85031682838528',1);

