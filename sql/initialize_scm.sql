use scm_v1;
select * from exercise;
-- alter table exercise modify column notation text;
-- delete from client where id=4
-- select * from exercise;

insert into exercise 
(created, name, notation, isPublic, category, comments, ownerId, clientId)
values
(NOW(), 'B1', '#rlrl rlrl rlrl rlrl', true, 'Basic', null, 1, 1),
(NOW(), 'B2', '#lrlr lrlr lrlr lrlr', true, 'Basic', null, 1, 1),
(NOW(), 'B3', '#rrll rrll rrll rrll', true, 'Basic', null, 1, 1),
(NOW(), 'B4', '#llrr llrr llrr llrr', true, 'Basic', null, 1, 1),
(NOW(), 'B5', '#rlrr lrll rlrr lrll', true, 'Basic', null, 1, 1),
(NOW(), 'B6', '#rllr lrrl rllr lrrl', true, 'Basic', null, 1, 1),
(NOW(), 'B7', '#rrlr llrl rrlr llrl', true, 'Basic', null, 1, 1),
(NOW(), 'B8', '#rlrl lrlr rlrl lrlr', true, 'Basic', null, 1, 1),
(NOW(), 'B9', '#rrrl rrrl rrrl rrrl', true, 'Basic', null, 1, 1),
(NOW(), 'B10', '#rlll rlll rlll rlll', true, 'Basic', null, 1, 1),
(NOW(), 'B11', '#lllr lllr lllr lllr', true, 'Basic', null, 1, 1),
(NOW(), 'B12', '#lrrr lrrr lrrr lrrr', true, 'Basic', null, 1, 1),
(NOW(), 'B13', '#rrrr llll rrrr llll', true, 'Basic', null, 1, 1),
(NOW(), 'B14', '#rlrl rrll rlrl rrll', true, 'Basic', null, 1, 1),
(NOW(), 'B15', '#lrlr llrr lrlr llrr', true, 'Basic', null, 1, 1),
(NOW(), 'B16', '#rlrl rlrr lrlr lrll', true, 'Basic', null, 1, 1),
(NOW(), 'B17', '#rlrl rllr lrlr lrrl', true, 'Basic', null, 1, 1),
(NOW(), 'B18', '#rlrl rrlr lrlr llrl', true, 'Basic', null, 1, 1),
(NOW(), 'B19', '#rlrl rrrl rlrl rrrl', true, 'Basic', null, 1, 1),
(NOW(), 'B20', '#rlrl rlll rlrl rlll', true, 'Basic', null, 1, 1),
(NOW(), 'B21', '#lrlr lllr lrlr lllr', true, 'Basic', null, 1, 1),
(NOW(), 'B22', '#lrlr lrrr lrlr lrrr', true, 'Basic', null, 1, 1),
(NOW(), 'B23', '#rlrl rrrr lrlr llll', true, 'Basic', null, 1, 1),
(NOW(), 'B24', 'rrll rlrr llrr lrll', true, 'Basic', null, 1, 1);

insert into exerciseset
(created, name, category, disabledExercises, exerciseOrdering, ownerId, clientId)
value
(now(), 'Basic 1', 'Basic', '', '1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20/21/22/23/24', 1, 1);

insert into exercisesetexercise
(exerciseSetId, exerciseId)
select 1, id 
from exercise;