export default (docConverts, hashAttr) => {
    return docConverts.map((doc) => {
        delete Object.assign(doc, { [hashAttr]: doc['_id'] })['_id']
        return {
            ...doc,
        }
    })
}
