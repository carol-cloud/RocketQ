const Database = require("../db/config");

const generateId = () => {
    let roomId = ""
    for(var i = 0; i < 6; i++){
        roomId += Math.floor(Math.random() * 10)
    }
    
    return parseInt(roomId);
};

const generateValidId = async () => {
    try {
        const roomId = generateId();
        const roomExistId = await checkIdRoom(roomId);
        if (!roomExistId){
            return roomId
        }
        return generateValidId();
    } catch (error) {
        console.log(error)
    }
}

const checkIdRoom = async (roomId) => {
    try {
        const db = await Database();
        const roomExistIds = await db.all(`SELECT id FROM rooms`)
        await db.close();
        return roomExistIds.some(roomExistId => roomExistId === roomId)
    } catch (error) {
        console.log(error)
    }
   
};

const create = async (req, res) => {
    try {
        const db = await Database();
        const { password } = req.body;
        const roomId = await generateValidId();

        await db.run(`INSERT INTO rooms (
            id,
            pass
        ) VALUES (
            ${ roomId },
            ${ password }
        )`);

        await db.close();

        res.redirect(`/room/${ roomId }`);
    } catch (error) {
       console.log(error);
    }
};

const searchAllQuestions = async(roomId) => {
    try {
        const db = await Database()
        const questions = await db.all(`SELECT * FROM questions WHERE room = ${roomId} and read = 0`);
        const questionsRead = await db.all(`SELECT * FROM questions WHERE room = ${roomId} and read = 1`);
        await db.close(); 
        return { questions, questionsRead }
        
    } catch (error) {
        console.log(error)
    }
    
}

const enter = (req, res) =>{
    const { roomId } = req.body
    res.redirect(`/room/${ roomId }`)
}

const open = async(req,res) => {
    const { room } = req.params;
    const { questions, questionsRead } = await searchAllQuestions(room);
    const isNoQuestion = verifyQuestions(questions, questionsRead);

    res.render("room", { questions, questionsRead, isNoQuestion, roomId: room })
};

const verifyQuestions = (questions, questionsRead) => {
    let isNoQuestions 
    if (questions.length == 0) {
        if (questionsRead.length == 0) {
            isNoQuestions = false
        }
    }
    return isNoQuestions
}

module.exports = {
    create,
    open,
    enter
}