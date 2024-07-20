import { create, all } from 'mathjs'

const config = {
    number: 'Fraction'
}

const math = create(all, config)

function numberToMathJax(number) {
    if (math.isInteger(number)) {
        return String(number)
    } else {
        return `${math.isNegative(number) ? '-' : ''}\\frac{${number.n}}{${number.d}}`
    }
}

export function matrixToMathJax(matrix, highlightRow, highlightCol) {

    let mathJax = `\\left[\\begin{array}{${'r'.repeat(matrix[0].length - 1)}|r}`

    mathJax += matrix.map((row, i) => (
        row.map((entry, j) => (
            i === highlightRow && j === highlightCol ? 
            ` \\class{highlight}{${numberToMathJax(entry)}}` : numberToMathJax(entry)
        )).join('&')
    )).join('\\\\')

    mathJax += '\\end{array}\\right]'

    return mathJax
}

function vectorToMathJax(vector) {
    let mathJax = '\\left[\\begin{array}{@{}c@{}}'

    mathJax += vector.map((row, i) => (
        numberToMathJax(vector[i])
    )).join('\\\\')

    mathJax += '\\end{array}\\right]'

    return mathJax
}

export function gaussianElimination(matrix) {
    let steps = []

    function evaluateMatrix(matrix) {
        matrix.map((row, i) => (
            row.map((entry, k) => (
                matrix[i][k] = math.fraction(String(math.evaluate(String(entry))))
            ))
        ))
    }

    function forwardElimination(matrix) {
        let pivots = 0;

        for (let col = 0; col < matrix[0].length - 1; col++) {
            for (let row = pivots; row < matrix.length; row++) {
                if (!math.equal(matrix[row][col], 0)) {
                
                    steps.push({ mathJax: '$$' + matrixToMathJax(matrix, row, col) + '$$', description: pivots === 0 ? 'Begin by locating our first pivot.' : 'Continue by locating our next pivot.'})

                    if (row !== pivots) {
                        swapRows(matrix, row, pivots, 'Swap rows so that the pivot is in its upmost position.')
                    }

                    if (!math.equal(matrix[pivots][col], 1)) {
                        multiplyRow(matrix, pivots, math.divide(1, matrix[pivots][col]), 'Divide the row by the pivot so that the pivot is equal to one.')
                    }

                    for (let k = row + 1; k < matrix.length; k++) {
                        if (!math.equal(matrix[k][col], 0)) {
                            addRows(matrix, k, pivots, math.multiply(matrix[k][col], -1), `Eliminate \\(${numberToMathJax(matrix[k][col])}\\) from row ${k + 1} by adding \\(${numberToMathJax(math.multiply(matrix[k][col], -1))}\\) times row ${pivots + 1} to it.`)
                        }
                    }

                    pivots++
                    break
                }
            }
        }
    }

    function backwardSubstitution(matrix) {
        for (let row = matrix.length - 1; row >= 0; row--) {
            for (let col = 0; col < matrix[0].length - 1; col++) {
                if (!math.equal(matrix[row][col], 0)) {
                    for (let k = row - 1; k >= 0; k--) {
                        if (!math.equal(matrix[k][col], 0)) {
                            addRows(matrix, k, row, math.multiply(matrix[k][col], -1), `Eliminate \\(${numberToMathJax(matrix[k][col])}\\) from row ${k + 1} by adding \\(${numberToMathJax(math.multiply(matrix[k][col], -1))}\\) times row ${row + 1} to it.`)
                            break
                        }
                    }
                    break
                }
            }
        }
    }

    function isConsistent(matrix) {
        for (let row = matrix.length - 1; row >= 0; row--) {

            if (math.equal(matrix[row][matrix[0].length - 1], 0)) {
                continue
            }

            let hasPivot = false

            for (let col = 0; col < matrix[0].length - 1; col++) {
                if (!math.equal(matrix[row][col], 0)) {
                    hasPivot = true
                    break
                }
            }

            if (!hasPivot) {
                steps.push({ mathJax: '$$' + matrixToMathJax(matrix, row, matrix[0].length - 1) + '$$', description: 'The system has no solutions because there is a pivot in the output column.'})
                return false
            }
        }
        return true
    }

    function findSolution(matrix) {
        let pivots = []
        let freeCols = Array(matrix[0].length - 1).fill(true)

        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[0].length - 1; col++) {
                if (!math.equal(matrix[row][col], 0)) {
                    pivots.push({ row, col })
                    freeCols[col] = false
                    break
                }
            }
        }

        if (pivots.length === matrix[0].length - 1) {
            let solutions = Array(matrix[0].length - 1).fill(0)

            for (let i = 0; i < pivots.length; i++) {
                solutions[pivots[i].col] = matrix[pivots[i].row][matrix[0].length - 1]
            }

            steps.push({ mathJax: '$$\\vec{x}=' + vectorToMathJax(solutions) + '$$', description: 'Solution.'})
        } else {
            let solutionSpan = []

            for (let i = 0; i < freeCols.length; i++) {
                if (freeCols[i]) {
                    let column = []
                    for (let j = 0; j < matrix.length; j++) {
                        column.push(math.multiply(matrix[j][i], -1))
                    }

                    column[i] = 1

                    solutionSpan.push(column)
                }
            }

            let outputCol = []
            let homogenous = true

            for (let i = 0; i < matrix.length; i++) {
                if (!math.equal(matrix[i][matrix[0].length - 1], 0)) {
                    homogenous = false
                }
                outputCol.push(matrix[i][matrix[0].length - 1])
            }

            if (!homogenous) {
                solutionSpan.push(outputCol)
            }

            let mathJax = '$$\\text{Span}\\left\\{'

            solutionSpan.map((vector) => (
                mathJax += vectorToMathJax(vector)
            ))

            mathJax += '\\right\\}$$'

            steps.push({ mathJax, description: 'Solution.'})
        }
    }

    function swapRows(matrix, i, j, description) {
        let before = matrixToMathJax(matrix)
        let operation = `R_${i + 1}\\longleftrightarrow R_${j + 1}`

        let row = matrix[i]
        matrix[i] = matrix[j]
        matrix[j] = row

        let after = matrixToMathJax(matrix)

        let mathJax = '$$' + before + '\\quad ' + operation + '\\quad' + after + '$$'

        steps.push({ mathJax, description})
    }

    function multiplyRow(matrix, i, num, description) {
        let before = matrixToMathJax(matrix)
        let operation = `${numberToMathJax(num)}R_${i + 1} \\longrightarrow R_${i + 1}`

        matrix[i] = math.multiply(matrix[i], num)

        let after = matrixToMathJax(matrix)

        let mathJax = '$$' + before + '\\quad ' + operation + '\\quad' + after + '$$'

        steps.push({ mathJax, description})
    }

    function addRows(matrix, i, j, num, description) {
        let before = matrixToMathJax(matrix)
        let operation = `R_${i + 1} ${math.isNegative(num) ? '-' : '+'} ${math.abs(num) === 1 ? '' : numberToMathJax(math.abs(num))}R_${j + 1} \\longrightarrow R_${i + 1}`

        matrix[i] = math.add(matrix[i], math.multiply(matrix[j], num))

        let after = matrixToMathJax(matrix) 

        let mathJax = '$$' + before + '\\quad ' + operation + '\\quad' + after + '$$'

        steps.push({ mathJax, description})
    }

    evaluateMatrix(matrix)
    forwardElimination(matrix)

    if (!isConsistent(matrix)) {
        return steps
    }

    backwardSubstitution(matrix)
    
    findSolution(matrix)


    return steps
}
