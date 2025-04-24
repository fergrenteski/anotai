const { runQuery } = require("../utils/queryHelper");

class GroupService {

    async getAllGroupsByUserId(userId) {
        return runQuery("select_groups_by_user_id", [userId]);
    }

    async getById(groupId) {
        return runQuery("select_group_by_id", [groupId]);
    }

    async create(name, category, description, userId) {
        return runQuery("insert_group", [name, description, category, userId]);
    }

    async update(name, category, description, groupId) {
        return runQuery("update_group", [name, description, category, groupId]);
    }

    async delete(groupId) {
        return runQuery("expire_group", [groupId]);
    }
}


module.exports = GroupService;
