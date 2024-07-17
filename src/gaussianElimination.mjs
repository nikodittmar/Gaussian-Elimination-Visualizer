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

export function gaussianElimination(matrix) {
    let steps = []

    function evaluateMatrix(matrix) {
        matrix.map((row, i) => {
            row.map((entry, k) => {
                matrix[i][k] = math.fraction(String(math.evaluate(String(entry))))
            })
        })
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

    function backSubstitution(matrix) {
        let pivot = matrix[0].length - 2

        for (let row = matrix.length - 1; row >= 0; row--) {
            if (!math.equal(matrix[row][pivot], 0)) {
                for (let col = pivot; col >= 0; col--) {
                    if (math.equal(matrix[row][col], 0)) {
                        pivot = col + 1
                        break
                    }
                }

                
            }
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

    return steps
}
