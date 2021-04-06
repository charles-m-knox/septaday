
export const deleteTaskQuery = 'DELETE FROM history WHERE id = ? AND date = ?';
export const dropHistoryDBQuery = 'drop table if exists history;'
export const dropTaskHistoryForDaySQL: string = `DELETE FROM history WHERE date = ?`;
export const dropTasksDBQuery = 'drop table if exists tasks;'
export const getTaskDaysSQL: string = `SELECT DISTINCT(date) as date FROM history ORDER BY date`;
export const getTaskHistorySQL = `SELECT t.id, h.completed, t.name, t.about, t.link, t.sortOrder, h.date FROM tasks AS t LEFT JOIN history AS h on h.id = t.id WHERE h.date = ? ORDER BY t.sortOrder ASC`;
export const getTaskStatsSQL: string = `SELECT completed FROM history`;
export const initializeHistoryDBQuery = 'create table if not exists history (id string not null, completed int, date int);'
export const initializeTodayTaskHistoryQuery = 'INSERT INTO history (id, completed, date) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT id, date FROM history WHERE id = ? AND date = ?)';
export const initializeTaskQuery = 'insert into tasks (id, name, about, link, sortOrder) values (?, ?, ?, ?, ?)';
export const initializeTasksDBQuery = 'create table if not exists tasks (id string primary key not null, name string, about text, link text, sortOrder int);'
export const insertTaskQuery = 'insert into history (id, completed, date) values (?, ?, ?)';
export const todayTaskHistorySelectQuery = 'select * from history where id = ? and date = ?';
