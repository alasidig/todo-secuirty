const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
async function init() {
    //1. get the connection to the database
    const db = await sqlite.open({
        filename: 'tasks_store.db3',
        driver: sqlite3.Database
    })
    //1. exec: executes the sql and returns nothing
    await db.exec(`create table if not exists tasks(
id integer primary key autoincrement, 
user text not null,
content text not null,
done integer default 0 -- SqLite doesn't have a boolean type
)`)
    await db.exec(`create table if not exists users(
id integer primary key autoincrement, 
username text not null unique,
password text not null
)`)


    // 3. insert records in the table note true is treated as 1
    try {
        const info = await db.run(`insert into tasks('id','user','content','done') 
    values  (1,'Ali','We have so many modules',0),
            (2,'Ali','Good sleep for better achievement',true),
            (3,'Ali','Keep healthy body',false)`)
        console.log(info)
    } catch (e) {
    }
    try {
         await db.run(`insert into users ('id','username','password') 
    values  (1,'ali','abc123'),
            (2,'khalid','123456')`)

    }catch (e) {
        console.log(e)
    }
}
init().then()