
import express from 'express'

import {
    deleteTopicStats,
    getTopicsStats
} from '../controllers/topicsController.js'

const router = express.Router()

router.get("/", getTopicsStats)
router.delete("/", deleteTopicStats)

export default router