import './App.css';
import { MathJax } from 'better-react-mathjax';
import { useState } from 'react';
import { gaussianElimination } from './gaussianElimination.mjs';

function App() {

  const [ matrix, setMatrix ] = useState(Array(3).fill().map(() => Array(4).fill(0)))
  const [ steps, setSteps ] = useState([])

  const handleChange = (row, col, event) => {
    let { value } = event.target;
    
    const newMatrix = matrix.map((r, rowIndex) =>
      rowIndex === row
        ? r.map((cell, colIndex) =>
            colIndex === col ? value : cell
          )
        : r
    );
    setMatrix(newMatrix);
  };

  const calculate = () => {
    const newMatrix = [...matrix]
    setSteps(gaussianElimination(newMatrix))
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

  return (
    <div className='page'>
      <h1>Step-by-Step Gaussian Elimination</h1>
      <h2>Input</h2>
      <table>
        <thead>
          <tr>
          { matrix[0].map((_, i) => (
            i === matrix[0].length - 1 ? <th key={i}><MathJax>{`$$b$$`}</MathJax></th> : <th key={i}><MathJax>{`$$x_${i + 1}$$`}</MathJax></th>
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

      <MathJax style={{display: 'none'}}>{"$$\\class{highlight}{x}$$"}</MathJax>

      <h2>Solution</h2>
      {
        steps.map((step) => (
          <div key={step.mathJax}>
            <MathJax className='description'>{step.description}</MathJax>
            <MathJax>{step.mathJax}</MathJax>
          </div>
        ))
      }
    </div>
  );
}

export default App;
