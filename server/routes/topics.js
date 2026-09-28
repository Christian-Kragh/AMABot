
import express from 'express'

import {
    deleteTopicStats
} from '../controllers/topicsController.js'

const router = express.Router()

router.delete("/", deleteTopicStats)

export default router