use scm_v1;
SET SQL_SAFE_UPDATES = 0;
-- delete from exercise where id > 27;
-- delete from accesstoken where userId=4;
-- alter table exerciseset add column comments varchar(500) default '';
-- select * from accesstoken;
-- update client set emailVerified=1;
select * from usersettings;

alter table usersettings
add column secondsBeforeStart int default 10;
