use scm_v1;
SET SQL_SAFE_UPDATES = 0;
-- delete from accesstoken where userId=4;
-- alter table exerciseset add column comments varchar(500) default '';
-- select * from accesstoken;
-- update client set emailVerified=1;
select * from exercise;

-- alter table exercise modify column notation text;
-- delete from client where id=4
-- select * from exercise;

set @aid = -1;
select @aid := id from client where username='gemerson';
insert into exercise 
(created, name, notation, isPublic, category, comments, ownerId, clientId)
values
(NOW(), 'B1', '#rlrl rlrl rlrl rlrl', true, 'Basic', null, @aid, @aid),
(NOW(), 'B2', '#lrlr lrlr lrlr lrlr', true, 'Basic', null, @aid, @aid),
(NOW(), 'B3', '#rrll rrll rrll rrll', true, 'Basic', null, @aid, @aid),
(NOW(), 'B4', '#llrr llrr llrr llrr', true, 'Basic', null, @aid, @aid),
(NOW(), 'B5', '#rlrr lrll rlrr lrll', true, 'Basic', null, @aid, @aid),
(NOW(), 'B6', '#rllr lrrl rllr lrrl', true, 'Basic', null, @aid, @aid),
(NOW(), 'B7', '#rrlr llrl rrlr llrl', true, 'Basic', null, @aid, @aid),
(NOW(), 'B8', '#rlrl lrlr rlrl lrlr', true, 'Basic', null, @aid, @aid),
(NOW(), 'B9', '#rrrl rrrl rrrl rrrl', true, 'Basic', null, @aid, @aid),
(NOW(), 'B10', '#rlll rlll rlll rlll', true, 'Basic', null, @aid, @aid),
(NOW(), 'B11', '#lllr lllr lllr lllr', true, 'Basic', null, @aid, @aid),
(NOW(), 'B12', '#lrrr lrrr lrrr lrrr', true, 'Basic', null, @aid, @aid),
(NOW(), 'B13', '#rrrr llll rrrr llll', true, 'Basic', null, @aid, @aid),
(NOW(), 'B14', '#rlrl rrll rlrl rrll', true, 'Basic', null, @aid, @aid),
(NOW(), 'B15', '#lrlr llrr lrlr llrr', true, 'Basic', null, @aid, @aid),
(NOW(), 'B16', '#rlrl rlrr lrlr lrll', true, 'Basic', null, @aid, @aid),
(NOW(), 'B17', '#rlrl rllr lrlr lrrl', true, 'Basic', null, @aid, @aid),
(NOW(), 'B18', '#rlrl rrlr lrlr llrl', true, 'Basic', null, @aid, @aid),
(NOW(), 'B19', '#rlrl rrrl rlrl rrrl', true, 'Basic', null, @aid, @aid),
(NOW(), 'B20', '#rlrl rlll rlrl rlll', true, 'Basic', null, @aid, @aid),
(NOW(), 'B21', '#lrlr lllr lrlr lllr', true, 'Basic', null, @aid, @aid),
(NOW(), 'B22', '#lrlr lrrr lrlr lrrr', true, 'Basic', null, @aid, @aid),
(NOW(), 'B23', '#rlrl rrrr lrlr llll', true, 'Basic', null, @aid, @aid),
(NOW(), 'B24', 'rrll rlrr llrr lrll', true, 'Basic', null, @aid, @aid);



insert into exerciseset
(created, name, category, disabledExercises, exerciseOrdering, ownerId, clientId)
value
(now(), 'Basic 1', 'Basic', '', '1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20/21/22/23/24', 1, 1);

insert into exercisesetexercise
(exerciseSetId, exerciseId)
select 1, id 
from exercise;

-- ALTER TABLE exercisesetexercise
-- ADD FOREIGN KEY (exerciseId)
-- REFERENCES exercise(id)