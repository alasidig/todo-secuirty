const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
const getDbConnection = async () => {
    return await sqlite.open({
        filename: 'tasks_store.db3',
        driver: sqlite3.Database
    })
}

async function getAllTasks() {
    const db = await getDbConnection();
    const rows = await db.all('select * from tasks order by id desc ')
    await db.close()
    // console.log(rows)
    return rows
}
const addTask = async (task) => {
    const db = await getDbConnection();
   const sql= await db.prepare('insert into tasks(user,content) values (?,?)')
    const meta = await sql.run([task.user, task.content])
    await db.close()
    return meta
}
module.exports = {getAllTasks, addTask}