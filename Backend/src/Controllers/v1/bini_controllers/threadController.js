import Thread from '../../../Models/bini_models/thread_model.js';

class ThreadController {
    constructor() {
        this.threadModel = new Thread();
    }

    async getThreads(req, res) {
        try {
            const threads = await this.threadModel.getThreads();
            return res.status(200).json(threads);
        } catch (error) {
            console.error('Error fetching threads:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

}

export default ThreadController;