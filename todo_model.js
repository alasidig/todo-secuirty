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
    await sql.finalize()
    await db.close()
    return meta
}
const getUserByUsername = async (name) => {
    const db = await getDbConnection();
    let sql = await db.prepare(`SELECT * FROM users where username = ?`);
    const username = await sql.get(name);
    await sql.finalize()
    await db.close()
    return username
}
const createUser = async userInfo => {
    const db = await getDbConnection();
    const sql = await db.prepare(`INSERT INTO users ( username, password ) 
            values (?,?)`);
    const info = await sql.run([userInfo.username,userInfo.password]);
    await sql.finalize()
    await db.close()
    return info
}
module.exports = {getAllTasks, addTask, createUser, getUserByUsername}