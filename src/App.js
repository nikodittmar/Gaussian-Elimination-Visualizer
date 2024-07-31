import './App.css';
import { MathJax } from 'better-react-mathjax';
import { useState } from 'react';
import { gaussianElimination } from './gaussianElimination.mjs';
import { create, all } from 'mathjs'

const config = {
    number: 'Fraction'
}

const math = create(all, config)

function App() {

  const [ matrix, setMatrix ] = useState(Array(3).fill().map(() => Array(4).fill(0)))
  const [ steps, setSteps ] = useState([])
  const [ stepsShown, setStepsShown ] = useState(1)
  const [ invalidMatrix, setInvalidMatrix ] = useState(false)

  const handleChange = (row, col, event) => {
    let { value } = event.target;

    if (/^[0-9./*+\-()]*$/.test(value)) {
      const newMatrix = matrix.map((r, rowIndex) =>
        rowIndex === row
          ? r.map((cell, colIndex) =>
              colIndex === col ? value : cell
            )
          : r
      )
      setMatrix(newMatrix)
    }
  }

  const removeBlank = (row, col) => {
    if (matrix[row][col] === '') {
      const newMatrix = matrix.map((r, rowIndex) =>
        rowIndex === row
          ? r.map((cell, colIndex) =>
              colIndex === col ? '0' : cell
            )
          : r
      )
      setMatrix(newMatrix)
    }
  }

  const calculate = () => {
    setInvalidMatrix(false)
    setSteps([])
    setStepsShown(0)

    const newMatrix = [...matrix]

    try {
      newMatrix.map((row, i) => (
        row.map((entry, k) => (
            matrix[i][k] = math.evaluate(String(entry))
        ))
      ))
      setSteps(gaussianElimination(newMatrix))
    } catch (err) {
      console.log(err)
      setInvalidMatrix(true)
    }
    
  }

  const handleChangeRows = (event) => {
    let diff = event.target.value - matrix.length

    const newMatrix = [...matrix]
    if (diff < 0) {
      newMatrix.length = event.target.value
    } else {
      for (let i = 0; i < diff; i++) {
        newMatrix.push(Array(matrix[0].length).fill(0))
      }
    }
    
    setMatrix(newMatrix)
  }
  
  const handleChangeColumns = (event) => {
    setMatrix((prevMatrix) => {
      return prevMatrix.map(row => {
        const currentColCount = row.length
        if (event.target.value > currentColCount) {
          return [...row, ...Array(event.target.value - currentColCount).fill(0)]
        } else {
          return row.slice(0, event.target.value)
        }
      })
    })
  }

  const nextStep = () => {
    setStepsShown(stepsShown + 1)
  }

  const showAllSteps = () => {
    setStepsShown(steps.length)
  }

  return (
    <div className='page'>
      <h1 className='title'>📚 Step-by-Step Gaussian Elimination</h1>
      <p>Welcome! This website guides you through each step of Gaussian elimination, making it easy to learn and understand the process. Simply input the size of your matrix, enter the augmented form, and press "Calculate" to see a step-by-step solution.</p>
      <table>
        <thead>
          <tr>
          { matrix[0].map((_, i) => (
            i === matrix[0].length - 1 ? 
            <th key={i + 'b'}><MathJax>{`$$b$$`}</MathJax></th> : 
            <th key={i + 'x'}><MathJax>{`$$x_${i+1}$$`}</MathJax></th>
          ))
          }
          </tr>
        </thead>
        <tbody>
        { matrix.map((row, i) => (
          <tr key={i}>
            {
              row.map((entry, j) => (
                <td key={i + j}>
                  <input 
                  value={entry}
                  className='matrix-input-field'
                  onChange={(event) => handleChange(i, j, event)}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => removeBlank(i, j)}
                />
                </td>
              ))
            }
          </tr>
        )) }
        </tbody>
      </table>
      
      <div>
        <label htmlFor="rows">Rows:</label>
        <select defaultValue={matrix.length} onChange={handleChangeRows} name="rows">
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
        </select>
        <label htmlFor="columns">Columns:</label>
        <select defaultValue={matrix[0].length} onChange={handleChangeColumns} name="columns">
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
        </select>
      </div>
      <button onClick={calculate}>Calculate!</button>
      {
        invalidMatrix && (
          <p className='invalid'>Invalid Matrix!</p>
        )
      }

      {
        (steps.length !== 0)
        && (
          <div className='solution'>
            <h2>Solution 📝</h2>
            {
              steps.map((step, i) => (
                  <div key={step.mathJax + step.description} className={i <= stepsShown ? '' : 'hidden'}>
                    <MathJax className='description'>{step.description}</MathJax>
                    <MathJax>{step.mathJax}</MathJax>
                  </div>
              ))
            }
            <div className={stepsShown >= steps.length - 1 ? 'hidden' : 'step-selector'}>
              <button onClick={nextStep}>Next Step</button>
              <button onClick={showAllSteps}>Show All Steps</button>
            </div>
          </div>
        )
      }
      <p className='footer'>Created by Niko Dittmar for UC Berkeley EECS 16A.</p>
      <MathJax style={{display: 'none'}}>{"$$\\class{highlight}{x}$$"}</MathJax>
    </div>
  );
}

export default App;
