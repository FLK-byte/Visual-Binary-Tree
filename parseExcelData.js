this.parseData = (data) => {
    const variableRegEx = /(?<=-)(\w+)/
    const variableValueRegEx = /(?<=: )(.+)(?=" |)/

    const propensionFields = ["PROPENSAO", "QTD", "NO"]

    const nodeTypes = {
        variable: "variable",
        tag: "tag",
        propension: "propension"
    }

    var tree = {
        nextItems: []
    }

    class Node {
        constructor(_value, _type, item) {
            this.value = _value,
            this.type = _type,
            this.nextItems = item ? [item] : []
        }
    }

    const getPropension = (obj) => {
        const [key, value] = obj
        if (propensionFields.includes(key)) return [key, value]
        return []
    }

    const getVariableNameAndValue = (obj) => {
        const [key, value] = obj
        const variableName = value.match(variableRegEx)
        const variableValue = value.match(variableValueRegEx)

        if (!variableName || !variableValue) return []
        return [variableName[0], variableValue[0]]
    }

    const verifyUpperCase = (value) => {
        return value == value.toUpperCase()
    }

    const getLastItem = (obj) => {
        if (obj.nextItems > 0) {
            getLastItem(obj.nextItems[0])
        }
        return obj.nextItems[0]
    }

    data.map((el, idx) => {
        const objValues = Object.entries(el)
        objValues.reduce((acc, current, currentidx, arr) => {
            const [hasPropensionField, hasPropensionValue] = getPropension(current)

            if (hasPropensionField && hasPropensionValue && acc && acc.type !== nodeTypes.propension) {   
                
                const propension = {}
                let i = currentidx
                while (i < arr.length) {
                    const [propensionField, propensionValue] = getPropension(arr[i])
                    propension[propensionField] = propensionValue
                    i+=1
                }
                const node = new Node(JSON.stringify(propension), nodeTypes.propension)
                acc.nextItems.push(node)
                return acc.nextItems[0]
                
            }

            const [variableName, variableValue] = getVariableNameAndValue(current)
            
            if (!variableName || !variableValue) return

            if (variableName && variableValue) {
                const node = new Node(
                    variableName,
                    verifyUpperCase(variableName) ? nodeTypes.variable : nodeTypes.tag,
                    new Node(
                        variableValue,
                        verifyUpperCase(variableValue) ? nodeTypes.variable : nodeTypes.tag
                    )
                )
                const lastItem = getLastItem(node)

                if (acc.nextItems.length > 0) {
                    if (acc.nextItems[acc.nextItems.length - 1].value == variableName) {

                        if (acc.nextItems[acc.nextItems.length - 1].nextItems[acc.nextItems[acc.nextItems.length - 1].nextItems.length - 1].value == variableValue) {
                            return acc.nextItems[acc.nextItems.length - 1].nextItems[acc.nextItems[acc.nextItems.length - 1].nextItems.length - 1]
                        }

                        acc.nextItems[acc.nextItems.length - 1].nextItems.push(node.nextItems[0])
                        return acc.nextItems[acc.nextItems.length - 1].nextItems[acc.nextItems[acc.nextItems.length - 1].nextItems.length - 1]
                    }
                }
                acc.nextItems.push(node)
                return lastItem
            }
        }, tree)

    })

    return tree
}