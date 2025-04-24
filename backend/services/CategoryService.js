const { runQuery } = require("../utils/queryHelper");

class CategoryService {

    async getAll() {
        return runQuery("select_groups_categories");
    }

}

module.exports = CategoryService;
