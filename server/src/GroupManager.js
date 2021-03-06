class GroupManager {
    groups = [];

    getGroupByName(name) {
        return this.groups
            .filter(e => e.name == name)[0]
    }

    getAll() {
        return this.groups
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
