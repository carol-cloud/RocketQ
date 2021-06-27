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
            ${roomId},
            ${password}
        )`);

        await db.close();

        res.redirect(`/room/${roomId}`);
    } catch (error) {
       console.log(error);
    }
};

module.exports = {
    create
}