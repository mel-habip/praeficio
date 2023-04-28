export default function WorkspaceMessagesRelationshipOrganizer(comments, parent_workspace_message_id = null) {
    const nestedComments = [];
    comments.forEach(comment => {
        if (comment.parent_workspace_message_id === parent_workspace_message_id) {
            const children = WorkspaceMessagesRelationshipOrganizer(comments, comment.workspace_message_id);
            if (children.length) {
                comment.children = children;
            }
            if (!comment.deleted || comment.children?.length) nestedComments.push(comment);
        }
    });
    return nestedComments;
};