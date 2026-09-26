
import express from 'express'

import {
    getAllMessages,
    createMessage,
    deleteMessages
} from '../controllers/messagesController.js'

const router = express.Router()

router.get("/", getAllMessages)
router.post("/", createMessage)
router.delete("/", deleteMessages)

export default router