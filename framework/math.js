function broadcast(arrays, operation) {
    const results = []
    const len = arrays.length
    var i = 0

    while (true) {
        const new_arrays = []
        let hasarray = false
        let proceed = false

        for (let j = 0; j < len; j++) {
            const array = arrays[j]
            if (Array.isArray(array)) {
                hasarray = true
                if (array.length === 1)
                    new_arrays[j] = array[0]
                else if (array.length > i) {
                    proceed = true
                    new_arrays[j] = array[i]
                }
                else return results
            } else new_arrays[j] = array
        }

        if (!hasarray && i === 0) {
            return operation(new_arrays)
        }
        results.push(broadcast(new_arrays, operation))

        if(!proceed) return results

        i += 1
    }
}

function operator(func) {
    return function () {
        return broadcast(arguments, func)
    }
}

const sub = operator(x => x[0] - x[1])
const add = operator(x => x[0] + x[1])
const mul = operator(x => x[0] * x[1])
const div = operator(x => x[0] / x[1])

function reduce_operator(func) {
    function f(arrays, axis = null, keep_dims = false, _current_axis = 0) {
        if (!(arrays instanceof Array)) return arrays
        if (axis == null || _current_axis == axis ||
            axis instanceof Array && axis.includes(_current_axis)) {

            let result_ = arrays[0]
            for (let j = 1; j < arrays.length; j++) {
                result_ = func(result_, arrays[j])
            }
            const result = f(result_, axis, keep_dims, _current_axis + 1)
            if (keep_dims) return [result]
            return result
        }
        return arrays.map(a => f(a, axis, keep_dims, _current_axis + 1))
    }
    return f
}

const sum = reduce_operator(add)


function mat_mul(M, A) {
    const output = []
    for (let j = 0; j < M.length; j++) {
        let v = 0
        for (let i = 0; i < A.length; i++) {
            v += A[i] * M[j][i]
        }
        output.push(v)
    }
    return output
}