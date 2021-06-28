const Database = require('../db/config')

const index = async(req,res) => {
    const { action, room, question } = req.params;
    const { password } = req.body;

    const verify = await verifyPass(room, password)
    if (verify){
        const actions = {
            delete: async (question) => await actionDelete(question),
            check: async (question) => await actionUpdateRead(question)
        };
        await actions[action](question);
    } else {
        res.render('passIncorrect', { room })
    }

    res.redirect(`/room/${ room }`)
    
}

const verifyPass = async(roomId, password) => {
    try {
        const db = await Database()
        const room = await db.get(`SELECT * FROM rooms WHERE id = ${ roomId } `)
        await db.close(); 
        return room.pass == password;
            
    } catch (error) {
        console.log(error)
    }
   
}

const actionDelete = async(questionId) => {
    try {
        const db = await Database();
        await db.run(`DELETE FROM questions WHERE id = ${ questionId }`)
        await db.close(); 
    } catch (error) {
        console.log(error)
    }
   
}

const actionUpdateRead = async(questionId) => {
    try {
        const db = await Database()
        await db.run(`UPDATE questions SET read = 1 WHERE id = ${ questionId }`)
        await db.close(); 
    } catch (error) {
        console.log(error)
    }
  
}

const create = async (req,res) => {
    const db = await Database();
    const { question } = req.body
    const { room } = req.params

    await db.run(`INSERT INTO questions(
        quest,
        room,
        read
    ) VALUES (
        "${ question }",
        ${ room },
        0
    )`)
    await db.close(); 
    res.redirect(`/room/${ room }`)
}

module.exports = {
    index,
    create
}