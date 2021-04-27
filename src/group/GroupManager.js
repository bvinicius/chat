const Group = require('./Group').default;

class GroupManager {
    groups = [];

    getGroupByName(name) {
        return this.groups
            .filter(e => e.name == name)[0]
    }

    addGroup(group) {
        const alreadyExists = this.groups
            .map(e => e.name)
            .includes(group.name);

        if (!alreadyExists) {
            this.groups.push(group);
            return true;
        }
        return false;
    }
}

module.exports = GroupManager;