
import express from 'express'

import {
    getAllAnswers,
    getAnswerByCategory,
    createAnswer,
    updateAnswerByCategory,
    deleteAnswer
} from '../controllers/answersController.js'

const router = express.Router()

router.get("/", getAllAnswers)
router.get("/:category", getAnswerByCategory)
router.post("/", createAnswer)
router.put("/:category", updateAnswerByCategory)
router.delete("/:category", deleteAnswer)

export default router