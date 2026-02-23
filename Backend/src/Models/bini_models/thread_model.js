import { connect } from '../../core/database.js';


class Thread {
    constructor() {
        this.connect();
    }
    async connect() {
        this.db = await connect();
    }

    async getThreads() {
        try {
            const query = `SELECT id, title, venue, date, is_pinned AS isPinned, author
            FROM community_threads`
            ;
            const [threads] = await this.db.query(query);
            return threads;
        }
        catch (err) {
            throw err;
        }
    }
}

export default Thread;