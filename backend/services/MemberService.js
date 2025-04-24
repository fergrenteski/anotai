const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");

class MemberService {

    async create(userId, groupId) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.insert_user_groups, [userId, groupId]);
        return { rows };
    }

    async delete(groupId) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.expire_user_groups, [groupId]);
        return { rows };
    }

}

module.exports = MemberService;
